using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.ModelsScaffold;
using Whatsapp_Backend.Services;
using Whatsapp_Backend.Models;
using Whatsapp_Backend.Models.DTOs;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authorization;

namespace Whatsapp_Backend.Controllers
{
    public class MarkReadConversationRequest
    {
        public string? PeerId { get; set; }
        public string? MessageType { get; set; }
    }

    [ApiController]
    [Authorize]
    [Route("api/messages")]
    public class MessagesController : ControllerBase
    {
        private const string MessageTypeChat = "Chat";
        private const string MessageTypeSticker = "Sticker";
        private const string MessageTypeLocation = "Location";
        private const string MessageTypeQuestion = "Question";
        private const string MessageTypeSchedule = "Schedule";
        private const string MessageTypeAnnouncement = "Announcement";

        private readonly AppDbContext _context;
        private readonly IMessageDispatchService _dispatchService;
        private readonly IHubContext<Hubs.ChatHub> _hubContext;
        private readonly MessageReactionService _messageReactionService;
        private readonly IConversationService _conversationService;

        public MessagesController(AppDbContext context, IMessageDispatchService dispatchService, IHubContext<Hubs.ChatHub> hubContext, MessageReactionService messageReactionService, IConversationService conversationService)
        {
            _context = context;
            _dispatchService = dispatchService;
            _hubContext = hubContext;
            _messageReactionService = messageReactionService;
            _conversationService = conversationService;
        }
        [HttpGet("counts")]
        public async Task<IActionResult> GetUnreadCounts()
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();

            // 🚀 STEP 1: Fetch unread deliveries
            var deliveries = await _context.MessageDeliveries
                .AsNoTracking()
                .Where(d => d.UserId == userId && !d.IsRead && d.Message != null)
                .Select(d => new 
                { 
                    MessageType = d.Message.MessageType, 
                    TargetType = d.Message.TargetType,
                    TargetId = d.Message.TargetId,
                    FromUserId = d.Message.FromUserId
                })
                .ToListAsync();

            // 🚀 STEP 2: Count unique threads per category (STRICT SEPARATION)
            var unreadThreadsByType = deliveries
                .GroupBy(d => 
                {
                    var mt = (d.MessageType ?? "").ToLower().Trim();
                    if (mt.StartsWith("announc") || mt.StartsWith("broad")) return "announcements";
                    if (mt.StartsWith("sched") || mt.StartsWith("appoint")) return "appointments";
                    if (mt.StartsWith("quest")) return "questions";
                    return "chat";
                })
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(d => 
                    {
                        var tt = (d.TargetType ?? "").ToLower().Trim();
                        var targetId = (d.TargetId ?? "").Trim();

                        if (tt == "department" || tt == "dept") return "D" + (string.IsNullOrEmpty(targetId) ? "0" : targetId);
                        if (tt == "global") return "G";
                        return "U" + d.FromUserId;
                    }).Distinct().Count()
                );

            var result = new
            {
                chat = unreadThreadsByType.ContainsKey("chat") ? unreadThreadsByType["chat"] : 0,
                questions = unreadThreadsByType.ContainsKey("questions") ? unreadThreadsByType["questions"] : 0,
                appointments = unreadThreadsByType.ContainsKey("appointments") ? unreadThreadsByType["appointments"] : 0,
                announcements = unreadThreadsByType.ContainsKey("announcements") ? unreadThreadsByType["announcements"] : 0,
                total = unreadThreadsByType.Values.Sum()
            };

            return Ok(result);
        }

        [HttpGet("conversations")]
        public async Task<IActionResult> GetConversationSummaries()
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();

            var summaries = await _conversationService.GetConversationsAsync(userId);
            return Ok(summaries);
        }
        [HttpPost("{messageId}/reaction")]
        public async Task<IActionResult> ToggleReaction(int messageId, [FromBody] ReactionRequest request)
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();
            if (string.IsNullOrWhiteSpace(request.ReactionType))
                return BadRequest("ReactionType is required.");

            await _messageReactionService.ToggleReaction(messageId, userId, request.ReactionType);

            // Get updated summary
            var reactions = await _context.MessageReactions
                .AsNoTracking()
                .Where(r => r.MessageId == messageId)
                .GroupBy(r => r.ReactionType)
                .Select(g => new ReactionSummaryDto
                {
                    ReactionType = g.Key,
                    Count = g.Count(),
                    IsReactedByMe = g.Any(r => r.UserId == userId)
                })
                .ToListAsync();

            // SignalR Broadcast
            var msg = await _context.Messages
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == messageId);
            if (msg != null)
            {
                // Broadcast to all relevant parties
                var broadcastData = new { MessageId = messageId, Reactions = reactions };
                if (msg.TargetType == "User")
                {
                    var targetIds = msg.TargetId.Split(',', StringSplitOptions.RemoveEmptyEntries)
                        .Select(tId => tId.Trim());
                    var groups = targetIds
                        .Select(tId => $"User_{tId}")
                        .Concat(new[] { $"User_{msg.FromUserId}" })
                        .Distinct()
                        .ToList();
                    await _hubContext.Clients.Groups(groups).SendAsync("ReactionUpdated", broadcastData);
                }
                else if (msg.TargetType == "Department")
                {
                    await _hubContext.Clients.Group($"Dept_{msg.TargetId}").SendAsync("ReactionUpdated", broadcastData);
                    await _hubContext.Clients.Group($"DeptChat_{msg.TargetId}").SendAsync("ReactionUpdated", broadcastData);
                }
                else
                {
                    await _hubContext.Clients.Group("GlobalChannel").SendAsync("ReactionUpdated", broadcastData);
                }
            }

            return Ok(new { success = true, reactions });
        }

        [HttpGet("{messageId}/reaction-details")]
        public async Task<IActionResult> GetReactionDetails(int messageId)
        {
            var reactions = await (from r in _context.MessageReactions
                                   where r.MessageId == messageId
                                   join u in _context.usersses on r.UserId equals u.DisplayId into userJoin
                                   from u in userJoin.DefaultIfEmpty()
                                   orderby r.CreatedAt descending
                                   select new ReactionDetailDto
                                    {
                                       UserId = r.UserId,
                                       UserName = u != null ? (u.nameuser ?? u.us_name ?? "مستخدم") : "مستخدم",
                                       ReactionType = r.ReactionType,
                                       CreatedAt = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc)
                                   }).AsNoTracking().ToListAsync();

            return Ok(reactions);
        }
        [HttpPost("dispatch")]
        public async Task<IActionResult> DispatchMessage([FromBody] MessageRequest request)
        {
            try
            {
                await _dispatchService.Dispatch(request);
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpPut("{messageId}")]
        public async Task<IActionResult> UpdateMessage(int messageId, [FromBody] MessageUpdateRequest request)
        {
            try
            {
                await _dispatchService.UpdateMessage(messageId, request.Payload ?? "");
                return Ok(new { success = true });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = ex.Message });
            }
        }

        [HttpGet("announcements")]
        public async Task<IActionResult> GetAnnouncements([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await GetMessagesByTypeInternal(MessageTypeAnnouncement, page, pageSize));
        }

        [HttpGet("questions")]
        public async Task<IActionResult> GetQuestions([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await GetMessagesByTypeInternal(MessageTypeQuestion, page, pageSize));
        }

        [HttpGet("appointments")]
        public async Task<IActionResult> GetAppointments([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await GetMessagesByTypeInternal(MessageTypeSchedule, page, pageSize));
        }

        [HttpGet("chats")]
        public async Task<IActionResult> GetChats([FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            return Ok(await GetMessagesByTypeInternal(MessageTypeChat, page, pageSize));
        }

        [HttpGet("details/{messageId}")]
        public async Task<IActionResult> GetMessageDetails(int messageId)
        {
            var results = await (from d in _context.MessageDeliveries
                                 where d.MessageId == messageId
                                 join u in _context.usersses on d.UserId equals u.DisplayId into userJoin
                                 from u in userJoin.DefaultIfEmpty()
                                 select new
                                 {
                                     UserId = d.UserId,
                                     UserName = u != null ? (u.nameuser ?? u.us_name ?? "مستلم بدون اسم") : "مستخدم غير مسجل",
                                     Status = (d.IsRead || d.Status == "Read") ? "Read" :
                                              (d.DeliveredAt != null || d.Status == "Delivered") ? "Delivered" : "Sent",
                                     IsRead = d.IsRead || d.Status == "Read",
                                     DeliveredAt = d.DeliveredAt,
                                     ReadAt = d.ReadAt,
                                     Avatar = ""
                                 }).AsNoTracking().ToListAsync();

            // ✅ Force Utc kind so JSON serializer adds the 'Z' suffix
            var finalDetails = results.Select(d => new
            {
                d.UserId,
                d.UserName,
                d.Status,
                d.IsRead,
                DeliveredAt = d.DeliveredAt.HasValue ? DateTime.SpecifyKind(d.DeliveredAt.Value, DateTimeKind.Utc) : (DateTime?)null,
                ReadAt = d.ReadAt.HasValue ? DateTime.SpecifyKind(d.ReadAt.Value, DateTimeKind.Utc) : (DateTime?)null,
                d.Avatar
            });

            return Ok(finalDetails);
        }

        [HttpGet("info/{messageId}")]
        public async Task<IActionResult> GetMessageInfo(int messageId)
        {
            return await GetMessageDetails(messageId);
        }

        [HttpGet("my-deliveries")]
        public async Task<IActionResult> GetMyDeliveries()
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();

            // 🚀 Return only IDs for high-efficiency unread tracking
            var deliveryIds = await _context.MessageDeliveries
                .AsNoTracking()
                .Where(d => d.UserId == userId && !d.IsRead)
                .OrderByDescending(d => d.Id)
                .Select(d => d.Id)
                .Take(500) 
                .ToListAsync();

            return Ok(deliveryIds);
        }

        [HttpPost("mark-read-conversation")]
        public async Task<IActionResult> MarkReadWholeConversation([FromBody] MarkReadConversationRequest request)
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();

            if (request == null || string.IsNullOrEmpty(request.PeerId)) return BadRequest();

            var cleanPeerId = request.PeerId.Replace("dept-", "");
            bool isDept = request.PeerId.StartsWith("dept-");

            var unreadQuery = _context.MessageDeliveries
                .Include(d => d.Message)
                .Where(d => d.UserId == userId && !d.IsRead && d.Message != null);

            if (request.PeerId == "global") {
                unreadQuery = unreadQuery.Where(d => d.Message.TargetType == "Global");
            } else if (isDept) {
                unreadQuery = unreadQuery.Where(d => d.Message.TargetType == "Department" && d.Message.TargetId == cleanPeerId);
            } else {
                if (!long.TryParse(cleanPeerId, out var peerId)) return BadRequest();
                unreadQuery = unreadQuery.Where(d => d.Message.FromUserId == peerId && (d.Message.TargetType == "User" || string.IsNullOrEmpty(d.Message.TargetType)));
            }

            if (!string.IsNullOrEmpty(request.MessageType)) {
                var mt = request.MessageType.ToLower();
                if (mt == "chat") {
                    unreadQuery = unreadQuery.Where(d => d.Message.MessageType.ToLower() == "chat" || d.Message.MessageType.ToLower() == "sticker" || d.Message.MessageType.ToLower() == "location");
                } else {
                    unreadQuery = unreadQuery.Where(d => d.Message.MessageType.ToLower() == mt);
                }
            }

            var toMark = await unreadQuery.ToListAsync();
            if (toMark.Any()) {
                var now = DateTime.UtcNow;
                foreach (var d in toMark) {
                    d.IsRead = true;
                    d.ReadAt = now;
                    d.Status = "Read";
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true, count = toMark.Count });
        }

        [HttpPost("mark-read-batch")]
        public async Task<IActionResult> MarkReadBatch([FromBody] List<int> deliveryIds, System.Threading.CancellationToken ct)
        {
            if (!TryGetCurrentUserId(out var displayId))
                return Unauthorized(new { message = "User identity missing or invalid in token." });

            if (deliveryIds == null || !deliveryIds.Any()) 
                return Ok(new { success = true, count = 0 });

            // 2. Delegate to Thin Service Layer (Strict Identity)
            var result = await _dispatchService.MarkMessagesAsReadAsync(displayId, deliveryIds, ct);

            int userId = displayId; // For use in SignalR payloads

            if (result.ReadDeliveryIds.Any())
            {
                // 🚀 BATCH NOTIFICATION STRATEGY: Group by Sender to avoid "Notification Explosion"
                var notificationsBySender = result.Notifications
                    .GroupBy(n => n.SenderId)
                    .ToList();

                foreach (var group in notificationsBySender)
                {
                    var senderId = group.Key;
                    var payload = new
                    {
                        ReaderId = userId,
                        ReadAt = result.ReadAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        MessageIds = group.Select(x => x.MessageId).ToList()
                    };

                    // Send ONE broadcast for all messages from this sender
                    await _hubContext.Clients.Group($"User_{senderId}").SendAsync("MessagesRead", payload);
                }
            }

            return Ok(new { 
                success = true, 
                count = result.ReadDeliveryIds.Count,
                readAt = result.ReadAt
            });
        }

        [HttpPost("mark-chat-read")]
        public async Task<IActionResult> MarkChatRead([FromQuery] int peerId)
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();

            var deliveries = await _context.MessageDeliveries
                .Include(d => d.Message)
                .Where(d => d.UserId == userId && d.Message != null && d.Message.FromUserId == peerId && !d.IsRead)
                .ToListAsync();

            if (deliveries.Any())
            {
                var now = DateTime.UtcNow;
                foreach (var d in deliveries)
                {
                    d.IsRead = true;
                    d.Status = "Read";
                    d.ReadAt = now;

                    // ✅ Notify the original sender
                    await _hubContext.Clients.Group($"User_{d.Message.FromUserId}").SendAsync("MessageRead", new
                    {
                        MessageId = d.MessageId,
                        RecipientId = d.UserId,
                        ReadAt = now.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    });
                }
                await _context.SaveChangesAsync();
            }

            return Ok(new { success = true });
        }

        [HttpPost("mark-read/{deliveryId}")]
        public async Task<IActionResult> MarkRead(int deliveryId)
        {
            var delivery = await _context.MessageDeliveries.FindAsync(deliveryId);
            if (delivery == null) return NotFound();
            if (!TryGetCurrentUserId(out var currentUserId)) return Unauthorized();
            if (delivery.UserId != currentUserId) return Forbid();

            if (!delivery.IsRead)
            {
                var now = DateTime.UtcNow;
                delivery.IsRead = true;
                delivery.Status = "Read";
                delivery.ReadAt = now;
                await _context.SaveChangesAsync();

                // Get message info for sender ID
                var msg = await _context.Messages.FindAsync(delivery.MessageId);
                if (msg != null)
                {
                    await _hubContext.Clients.Group($"User_{msg.FromUserId}").SendAsync("MessageRead", new
                    {
                        MessageId = delivery.MessageId,
                        RecipientId = delivery.UserId,
                        ReadAt = now.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    });
                }
            }
            return Ok(new { success = true });
        }

        [HttpPost("mark-delivered-batch")]
        public async Task<IActionResult> MarkDeliveredBatch([FromBody] List<int> deliveryIds)
        {
            if (deliveryIds == null || !deliveryIds.Any()) return Ok(new { success = true });
            if (!TryGetCurrentUserId(out var currentUserId)) return Unauthorized();

            var deliveries = await _context.MessageDeliveries
                .Include(d => d.Message)
                .Where(d => deliveryIds.Contains(d.Id) && d.DeliveredAt == null && d.UserId == currentUserId)
                .ToListAsync();

            if (deliveries.Any())
            {
                var now = DateTime.UtcNow;
                foreach (var d in deliveries)
                {
                    d.DeliveredAt = now;
                    if (string.IsNullOrEmpty(d.Status) || d.Status == "Sent")
                    {
                        d.Status = "Delivered";
                    }
                }
                await _context.SaveChangesAsync();

                // 🚀 BATCH NOTIFICATION: Group by sender to avoid SignalR flood
                var bySender = deliveries.GroupBy(d => d.Message.FromUserId).ToList();
                foreach (var group in bySender)
                {
                    var senderId = group.Key;
                    var payload = new
                    {
                        RecipientId = currentUserId,
                        DeliveredAt = now.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                        MessageIds = group.Select(x => x.MessageId).ToList()
                    };
                    await _hubContext.Clients.Group($"User_{senderId}").SendAsync("MessagesDelivered", payload);
                }
            }

            return Ok(new { success = true });
        }

        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteMessage(int id)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return NotFound();
            if (!TryGetCurrentUserId(out var currentUserId)) return Unauthorized();
            if (message.FromUserId != currentUserId) return Forbid();

            var deliveries = await _context.MessageDeliveries.Where(d => d.MessageId == id).ToListAsync();
            _context.MessageDeliveries.RemoveRange(deliveries);
            _context.Messages.Remove(message);
            await _context.SaveChangesAsync();

            return Ok(new { success = true });
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllMessages([FromQuery] string? messageType, [FromQuery] int page = 1, [FromQuery] int pageSize = 100)
        {
            if (!TryGetCurrentUserId(out var userId)) return Unauthorized();
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 1 : (pageSize > 200 ? 200 : pageSize);

            // 1. Start with base query focused on identity (Sender OR Recipient)
            var baseQuery = _context.Messages
                .Where(m => m.FromUserId == userId || _context.MessageDeliveries.Any(d => d.MessageId == m.Id && d.UserId == userId));

            // 2. Relaxed Filtering: Only filter by type if messageType is provided and NOT "All"
            if (!string.IsNullOrEmpty(messageType) && !messageType.Equals("All", StringComparison.OrdinalIgnoreCase))
            {
                if (messageType.Equals(MessageTypeChat, StringComparison.OrdinalIgnoreCase)) {
                    baseQuery = baseQuery.Where(m => m.MessageType == MessageTypeChat || m.MessageType == MessageTypeSticker || m.MessageType == MessageTypeLocation);
                } else {
                    baseQuery = baseQuery.Where(m => m.MessageType == messageType);
                }
            }

            // 3. Optimized projection to fetch history
            var results = await (from m in baseQuery
                                 join u in _context.usersses on m.FromUserId equals u.DisplayId into userJoin
                                 from u in userJoin.DefaultIfEmpty()
                                 orderby m.CreatedAt descending
                                 select new
                                 {
                                     m.Id,
                                     m.Payload,
                                     m.MessageType,
                                     m.CreatedAt,
                                     m.FromUserId,
                                     m.TargetType,
                                     m.TargetId,
                                     FromUserName = u != null ? (u.nameuser ?? u.us_name ?? "مستخدم") : "مستخدم",
                                     
                                     // Get current user's delivery info in the same query
                                     MyDelivery = _context.MessageDeliveries.FirstOrDefault(d => d.MessageId == m.Id && d.UserId == userId),

                                     // Status check for other recipients (Double-Checks)
                                     IsReadByRecipient = m.FromUserId == userId 
                                        ? (bool?)(_context.MessageDeliveries.Any(d => d.MessageId == m.Id && d.UserId != userId) && 
                                                 _context.MessageDeliveries.Where(d => d.MessageId == m.Id && d.UserId != userId).All(d => d.IsRead))
                                        : null,
                                     
                                     IsDeliveredByRecipient = m.FromUserId == userId 
                                        ? (bool?)(_context.MessageDeliveries.Any(d => d.MessageId == m.Id && d.UserId != userId) && 
                                                 _context.MessageDeliveries.Where(d => d.MessageId == m.Id && d.UserId != userId).All(d => d.DeliveredAt != null))
                                        : null
                                 })
                                 .AsNoTracking()
                                 .Skip((page - 1) * pageSize)
                                 .Take(pageSize)
                                 .ToListAsync();

            // 4. Fetch reactions for the paginated messages
            var messageIds = results.Select(r => r.Id).Distinct().ToList();
            var allReactions = await _context.MessageReactions
                .AsNoTracking()
                .Where(r => messageIds.Contains(r.MessageId))
                .GroupBy(r => new { r.MessageId, r.ReactionType })
                .Select(g => new
                {
                    g.Key.MessageId,
                    g.Key.ReactionType,
                    Count = g.Count(),
                    IsReactedByMe = g.Any(r => r.UserId == userId)
                })
                .ToListAsync();

            // 5. Final projection
            var finalResults = results.Select(r => new
            {
                r.Id,
                r.Payload,
                r.MessageType,
                CreatedAt = DateTime.SpecifyKind(r.CreatedAt, DateTimeKind.Utc),
                r.FromUserId,
                r.TargetType,
                r.TargetId,
                r.FromUserName,
                MyDelivery = r.MyDelivery != null ? new
                {
                    r.MyDelivery.Id,
                    r.MyDelivery.MessageId,
                    r.MyDelivery.UserId,
                    r.MyDelivery.IsRead,
                    r.MyDelivery.Status,
                    DeliveredAt = r.MyDelivery.DeliveredAt.HasValue ? DateTime.SpecifyKind(r.MyDelivery.DeliveredAt.Value, DateTimeKind.Utc) : (DateTime?)null,
                    ReadAt = r.MyDelivery.ReadAt.HasValue ? DateTime.SpecifyKind(r.MyDelivery.ReadAt.Value, DateTimeKind.Utc) : (DateTime?)null
                } : null,
                r.IsReadByRecipient,
                r.IsDeliveredByRecipient,
                Reactions = allReactions
                    .Where(re => re.MessageId == r.Id)
                    .Select(re => new ReactionSummaryDto
                    {
                        ReactionType = re.ReactionType,
                        Count = re.Count,
                        IsReactedByMe = re.IsReactedByMe
                    }).ToList()
            });

            return Ok(finalResults);
        }

        [HttpGet("by-type")]
        public async Task<IActionResult> GetMessagesByType([FromQuery] string type, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
        {
            if (string.IsNullOrWhiteSpace(type)) return BadRequest("type is required.");
            return Ok(await GetMessagesByTypeInternal(type, page, pageSize));
        }

        private async Task<List<MessageDto>> GetMessagesByTypeInternal(string messageType, int page, int pageSize)
        {
            page = page < 1 ? 1 : page;
            pageSize = pageSize < 1 ? 1 : (pageSize > 200 ? 200 : pageSize);

            var rawMessages = await (from m in _context.Messages
                                     where m.MessageType == messageType
                                     join u in _context.usersses on m.FromUserId equals u.DisplayId
                                     orderby m.CreatedAt descending
                                     select new
                                     {
                                         m.Id,
                                         m.Payload,
                                         Text = m.Payload,
                                         m.MessageType,
                                         m.CreatedAt,
                                         m.FromUserId,
                                         m.TargetType,
                                         m.TargetId,
                                         FromUserName = u.nameuser ?? u.us_name ?? "مستخدم"
                                     })
                                     .AsNoTracking()
                                     .Skip((page - 1) * pageSize)
                                     .Take(pageSize)
                                     .ToListAsync();

            var messageIds = rawMessages.Select(x => x.Id).ToList();
            var stats = await _context.MessageDeliveries
                .AsNoTracking()
                .Where(d => messageIds.Contains(d.MessageId))
                .GroupBy(d => d.MessageId)
                .Select(g => new
                {
                    MessageId = g.Key,
                    RecipientsCount = g.Count(),
                    ReadCount = g.Count(x => x.IsRead || x.Status == "Read")
                })
                .ToDictionaryAsync(x => x.MessageId, x => (x.RecipientsCount, x.ReadCount));

            return rawMessages.Select(r =>
            {
                var stat = stats.TryGetValue(r.Id, out var s) ? s : (RecipientsCount: 0, ReadCount: 0);
                return new MessageDto
                {
                    Id = r.Id,
                    Payload = r.Payload,
                    Text = r.Text,
                    MessageType = r.MessageType,
                    CreatedAt = r.CreatedAt,
                    FromUserId = r.FromUserId,
                    TargetType = r.TargetType,
                    TargetId = r.TargetId,
                    FromUserName = r.FromUserName,
                    RecipientsCount = stat.RecipientsCount,
                    ReadCount = stat.ReadCount,
                    IsReadByMe = stat.ReadCount > 0
                };
            }).ToList();
        }

        private bool TryGetCurrentUserId(out int userId)
        {
            var displayIdStr = User.FindFirst("displayId")?.Value ?? User.FindFirst("DisplayId")?.Value;
            return int.TryParse(displayIdStr, out userId) && userId > 0;
        }
    }
}
