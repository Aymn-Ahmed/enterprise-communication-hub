using System;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.SignalR;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.ModelsScaffold;

namespace Whatsapp_Backend.Services
{
    public class MessageDispatchService : IMessageDispatchService
    {
        private readonly AppDbContext _context;
        private readonly IRecipientResolver _recipientResolver;
        private readonly IHubContext<Hubs.ChatHub> _hubContext;

        public MessageDispatchService(AppDbContext context, IRecipientResolver recipientResolver, IHubContext<Hubs.ChatHub> hubContext)
        {
            _context = context;
            _recipientResolver = recipientResolver;
            _hubContext = hubContext;
        }

        public async Task Dispatch(MessageRequest request)
        {
            // 1. Create the master message
            var message = new Message
            {
                FromUserId = request.FromUserId,
                MessageType = request.MessageType ?? "Chat",
                Payload = request.Payload ?? "",
                TargetType = request.TargetType ?? "Global",
                TargetId = request.TargetId ?? "0",
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            // 2. Resolve recipients and EXCLUDE the sender (Senders don't need delivery records for themselves)
            var recipientIds = await _recipientResolver.GetRecipientIds(request.TargetType ?? "Global", request.TargetId ?? "0");
            recipientIds.Remove(request.FromUserId);

            // 3. Create deliveries for ACTUAL recipients only
            var deliveries = recipientIds
                .Select(userId =>
                {
                    bool isOnline = Hubs.ChatHub._onlineUsers.ContainsKey(userId.ToString());
                    Console.WriteLine($"[Dispatch] Recipient: {userId}, IsOnline: {isOnline}");

                    return new MessageDelivery
                    {
                        MessageId = message.Id,
                        UserId = userId,
                        IsRead = false,
                        Status = isOnline ? "Delivered" : "Sent",
                        DeliveredAt = isOnline ? DateTime.UtcNow : null,
                        ReadAt = null
                    };
                }).ToList();

            if (deliveries.Any())
            {
                _context.MessageDeliveries.AddRange(deliveries);
                await _context.SaveChangesAsync();
            }

            // 4. Construct the base notification message
            var baseNotification = new
            {
                Id = message.Id,
                message.FromUserId,
                message.MessageType,
                message.Payload,
                CreatedAt = message.CreatedAt.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                message.TargetType,
                message.TargetId
            };

            // 5. Notify Recipients with their specific Delivery info
            foreach (var delivery in deliveries)
            {
                var recipientMsg = new
                {
                    baseNotification.Id,
                    baseNotification.FromUserId,
                    baseNotification.MessageType,
                    baseNotification.Payload,
                    baseNotification.CreatedAt,
                    baseNotification.TargetType,
                    baseNotification.TargetId,
                    MyDelivery = new
                    {
                        delivery.Id,
                        delivery.MessageId,
                        delivery.UserId,
                        delivery.IsRead,
                        delivery.Status,
                        delivery.DeliveredAt,
                        delivery.ReadAt
                    },
                    DeliveryId = delivery.Id,
                    IsRead = delivery.IsRead,
                    Status = delivery.Status
                };

                await _hubContext.Clients.Group($"User_{delivery.UserId}").SendAsync("ReceiveNotification", recipientMsg);
                await _hubContext.Clients.Group($"User_{delivery.UserId}").SendAsync("ReceiveMessage", recipientMsg);

                // If delivered, notify sender for double checkmarks
                if (delivery.Status == "Delivered")
                {
                    await _hubContext.Clients.Group($"User_{message.FromUserId}").SendAsync("MessageDelivered", new
                    {
                        MessageId = message.Id,
                        RecipientId = delivery.UserId,
                        DeliveredAt = delivery.DeliveredAt?.ToString("yyyy-MM-ddTHH:mm:ssZ")
                    });
                }
            }

            // 6. Notify Sender (Senders don't have a MyDelivery context)
            var senderMsg = new
            {
                baseNotification.Id,
                baseNotification.FromUserId,
                baseNotification.MessageType,
                baseNotification.Payload,
                baseNotification.CreatedAt,
                baseNotification.TargetType,
                baseNotification.TargetId,
                MyDelivery = (object?)null,
                DeliveryId = (int?)null, // No delivery for sender
                IsRead = (bool?)null,    // Not applicable for sent messages
                Status = "Sent"
            };
            await _hubContext.Clients.Group($"User_{message.FromUserId}").SendAsync("ReceiveNotification", senderMsg);
            await _hubContext.Clients.Group($"User_{message.FromUserId}").SendAsync("ReceiveMessage", senderMsg);
        }

        public async Task UpdateMessage(int id, string payload)
        {
            var message = await _context.Messages.FindAsync(id);
            if (message == null) return;

            message.Payload = payload;
            await _context.SaveChangesAsync();

            // Notify recipients via SignalR
            var recipientIds = await _context.MessageDeliveries
                .Where(d => d.MessageId == id)
                .Select(d => d.UserId)
                .ToListAsync();

            var updateMsg = new
            {
                MessageId = id,
                Payload = payload,
                UpdatedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ")
            };

            foreach (var userId in recipientIds)
            {
                await _hubContext.Clients.Group($"User_{userId}").SendAsync("MessageUpdated", updateMsg);
            }

            // Also notify the sender
            await _hubContext.Clients.Group($"User_{message.FromUserId}").SendAsync("MessageUpdated", updateMsg);
        }

        public async Task<BatchReadResult> MarkMessagesAsReadAsync(int displayId, List<int> deliveryIds, System.Threading.CancellationToken ct)
        {
            var result = new BatchReadResult { ReadAt = DateTime.UtcNow };
            if (deliveryIds == null || !deliveryIds.Any()) return result;

            // 1. Limit Guardian: Process only 100 at a time for stability
            var targetIds = deliveryIds.Distinct().Take(100).ToList();

            Console.WriteLine($"🔍 [SERVER_READ_DEBUG] User DisplayId: {displayId} attempting to read Deliveries: {string.Join(",", targetIds)}");
            try
            {
                // 🔍 Check for existing transaction from Middleware
                bool hasExternalTransaction = _context.Database.CurrentTransaction != null;

                // 🛡️ Use execution strategy for resilient execution
                var strategy = _context.Database.CreateExecutionStrategy();
                await strategy.ExecuteAsync(async () =>
                {
                    // 🔍 DIAGNOSTIC LOGS: Check what's actually in the DB for these IDs
                    var diagnosticInfo = await _context.MessageDeliveries
                        .Where(d => targetIds.Contains(d.Id))
                        .Select(d => new { d.Id, d.UserId, d.IsRead })
                        .ToListAsync(ct);

                    Console.WriteLine($"📊 [DB_DIAGNOSTIC] Found {diagnosticInfo.Count} of {targetIds.Count} requested IDs.");
                    foreach (var d in diagnosticInfo)
                    {
                        Console.WriteLine($"   ID: {d.Id} | UserInDB: {d.UserId} | Target: {displayId} | IsRead: {d.IsRead}");
                    }

                    // 🛠️ Selective Retrieval: Fetch notification metadata BEFORE update
                    var pendingUpdates = await _context.MessageDeliveries
                        .Where(d => targetIds.Contains(d.Id) && !d.IsRead && d.UserId == displayId)
                        .Select(d => new 
                        { 
                            d.Id, 
                            d.MessageId, 
                            SenderId = d.Message.FromUserId, 
                            d.UserId 
                        })
                        .ToListAsync(ct);

                    Console.WriteLine($"📝 [SERVER_READ_DEBUG] pendingUpdates.Count: {pendingUpdates.Count}");

                    if (!pendingUpdates.Any())
                    {
                        Console.WriteLine("⚠️ [SERVER_READ_DEBUG] No matching delivery records found for this user with the provided IDs.");
                    }

                    if (pendingUpdates.Any())
                    {
                        var actualIdsToUpdate = pendingUpdates.Select(x => x.Id).ToList();

                        // 🚀 Atomic Bulk Update (EF Core 9 - No change tracking)
                        int updatedCount = await _context.MessageDeliveries
                            .Where(d => actualIdsToUpdate.Contains(d.Id))
                            .ExecuteUpdateAsync(s => s
                                .SetProperty(d => d.IsRead, true)
                                .SetProperty(d => d.Status, "Read")
                                .SetProperty(d => d.ReadAt, result.ReadAt), ct);

                        Console.WriteLine($"✅ [SERVER_READ_DEBUG] Successfully updated {updatedCount} records in SQL.");
                        
                        result.ReadDeliveryIds = actualIdsToUpdate;
                        result.Notifications = pendingUpdates.Select(x => new ReadNotificationDto
                        {
                            MessageId = x.MessageId,
                            SenderId = x.SenderId,
                            RecipientId = x.UserId
                        }).ToList();
                    }
                    else
                    {
                         Console.WriteLine("❌ [SERVER_READ_DEBUG] Still no matches found after fallback. Verify IDs and User claims.");
                    }
                });
            }
            catch (OperationCanceledException)
            {
                // 🛑 Graceful exit if user cancels request/closes tab
                throw; 
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[MarkReadBatch] Fatal Error: {ex.Message}");
                throw;
            }

            return result;
        }
    }
}
