using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.Models.DTOs;
using Whatsapp_Backend.ModelsScaffold;

namespace Whatsapp_Backend.Services
{
    public class ConversationService : IConversationService
    {
        private readonly AppDbContext _context;

        public ConversationService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ConversationSummaryDto>> GetConversationsAsync(int userId)
        {
            // 1. Get IDs of all peers the user has interacted with (Sent or Received)
            // This is done in SQL to avoid loading all participants
            var peerIdsQuery = _context.MessageDeliveries
                .Where(d => (d.UserId == userId || d.Message.FromUserId == userId) 
                         && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))
                .Select(d => d.UserId == userId ? d.Message.FromUserId : d.UserId)
                .Where(id => id != userId)
                .Distinct();

            // 2. Main query: Join peers with their details and latest message info
            // Everything here is translated to a single SQL query with subqueries
            var rawSummaries = await (from peerId in peerIdsQuery
                                      join u in _context.usersses on peerId equals u.DisplayId
                                      
                                      // Get the latest message between userId and peerId
                                      let lastMsg = _context.Messages
                                          .Where(m => (m.TargetType == null || m.TargetType == "" || m.TargetType == "User" || m.TargetType == "user") && 
                                                   ((m.FromUserId == userId && _context.MessageDeliveries.Any(d => d.MessageId == m.Id && d.UserId == peerId))
                                                 || (m.FromUserId == peerId && _context.MessageDeliveries.Any(d => d.MessageId == m.Id && d.UserId == userId))))
                                          .OrderByDescending(m => m.CreatedAt)
                                          .FirstOrDefault()

                                      // Get unread count for this peer
                                      let unreadCount = _context.MessageDeliveries
                                          .Count(d => d.UserId == userId && d.Message.FromUserId == peerId && !d.IsRead 
                                                   && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))

                                      // Get unread counts separated by MessageType
                                      let unreadChatCount = _context.MessageDeliveries
                                          .Count(d => d.UserId == userId && d.Message.FromUserId == peerId && !d.IsRead 
                                                   && d.Message.MessageType == "Chat" && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))

                                      let unreadQuestionCount = _context.MessageDeliveries
                                          .Count(d => d.UserId == userId && d.Message.FromUserId == peerId && !d.IsRead 
                                                   && d.Message.MessageType == "Question" && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))

                                      let unreadScheduleCount = _context.MessageDeliveries
                                          .Count(d => d.UserId == userId && d.Message.FromUserId == peerId && !d.IsRead 
                                                   && d.Message.MessageType == "Schedule" && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))

                                      let unreadAnnouncementCount = _context.MessageDeliveries
                                          .Count(d => d.UserId == userId && d.Message.FromUserId == peerId && !d.IsRead 
                                                   && d.Message.MessageType == "Announcement" && (d.Message.TargetType == null || d.Message.TargetType == "" || d.Message.TargetType == "User" || d.Message.TargetType == "user"))

                                      // Get delivery status of the latest message
                                      let lastDelivery = lastMsg != null 
                                          ? _context.MessageDeliveries.FirstOrDefault(d => d.MessageId == lastMsg.Id && d.UserId == (lastMsg.FromUserId == userId ? peerId : userId))
                                          : null

                                      where lastMsg != null // Only show actual conversations
                                      select new
                                      {
                                          Peer = u,
                                          LastMsg = lastMsg,
                                          Unread = unreadCount,
                                          UnreadChatCount = unreadChatCount,
                                          UnreadQuestionCount = unreadQuestionCount,
                                          UnreadScheduleCount = unreadScheduleCount,
                                          UnreadAnnouncementCount = unreadAnnouncementCount,
                                          LastDeliveryStatus = lastDelivery != null ? lastDelivery.Status : "Sent"
                                      }).ToListAsync();

            // 3. Post-process in memory (Text extraction and DTO mapping)
            // This is efficient because we only process the final result set (usually 10-50 items)
            var summaries = rawSummaries.Select(r => new ConversationSummaryDto
            {
                Id = r.Peer.DisplayId,
                DisplayId = r.Peer.DisplayId,
                Name = r.Peer.nameuser ?? r.Peer.us_name ?? "مستخدم",
                WorkId = r.Peer.WorkId,
                Type = "User",
                AvatarUrl = r.Peer.AvatarUrl,
                CoverUrl = r.Peer.CoverUrl,
                UnreadCount = r.Unread,
                UnreadChatCount = r.UnreadChatCount,
                UnreadQuestionCount = r.UnreadQuestionCount,
                UnreadScheduleCount = r.UnreadScheduleCount,
                UnreadAnnouncementCount = r.UnreadAnnouncementCount,
                LastActiveAt = r.Peer.LastActiveAt,
                LastMessage = new LastMessagePreviewDto
                {
                    Text = ExtractTextPreview(r.LastMsg.Payload),
                    Timestamp = DateTime.SpecifyKind(r.LastMsg.CreatedAt, DateTimeKind.Utc),
                    Status = r.LastDeliveryStatus ?? "Sent",
                    Type = r.LastMsg.MessageType,
                    TargetType = r.LastMsg.TargetType,
                    IsMe = r.LastMsg.FromUserId == userId,
                    SenderId = r.LastMsg.FromUserId
                }
            }).ToList();

            // 4. Get Department Summaries
            // Identify all departments where the user is either a RECIPIENT or a SENDER
            var deptIdsAsRecipient = await _context.MessageDeliveries
                .Where(d => d.UserId == userId && d.Message != null && 
                    (d.Message.TargetType == "Department" || d.Message.TargetType == "department" || d.Message.TargetType == "Dept" || d.Message.TargetType == "dept"))
                .Select(d => d.Message.TargetId)
                .Distinct()
                .ToListAsync();

            var deptIdsAsSender = await _context.Messages
                .Where(m => m.FromUserId == userId && (m.TargetType == "Department" || m.TargetType == "department" || m.TargetType == "Dept" || m.TargetType == "dept"))
                .Select(m => m.TargetId)
                .Distinct()
                .ToListAsync();

            var allDeptIds = deptIdsAsRecipient.Union(deptIdsAsSender).Distinct().ToList();

            foreach (var deptIdStr in allDeptIds)
            {
                if (string.IsNullOrEmpty(deptIdStr) || !int.TryParse(deptIdStr, out var deptId)) continue;

                // Last message in this department (regardless of who sent it) for the preview
                var lastDeptMsg = await _context.Messages
                    .Where(m => (m.TargetType == "Department" || m.TargetType == "department" || m.TargetType == "Dept" || m.TargetType == "dept") && m.TargetId == deptIdStr)
                    .OrderByDescending(m => m.CreatedAt)
                    .FirstOrDefaultAsync();

                if (lastDeptMsg == null) continue;

                // Unread counts strictly by MessageType for the CURRENT user
                var unreadDeptQuery = _context.MessageDeliveries.Where(d => d.UserId == userId && d.Message.TargetId == deptIdStr && 
                    (d.Message.TargetType == "Department" || d.Message.TargetType == "department" || d.Message.TargetType == "Dept" || d.Message.TargetType == "dept") && !d.IsRead);

                var unreadDeptCount = await unreadDeptQuery.CountAsync();
                
                // Flexible type checks
                var unreadDeptChat = await unreadDeptQuery.CountAsync(d => d.Message.MessageType.StartsWith("Chat") || d.Message.MessageType.StartsWith("chat"));
                var unreadDeptQuestion = await unreadDeptQuery.CountAsync(d => d.Message.MessageType.StartsWith("Question") || d.Message.MessageType.StartsWith("question") || d.Message.MessageType.StartsWith("Ask") || d.Message.MessageType.StartsWith("ask"));
                var unreadDeptSchedule = await unreadDeptQuery.CountAsync(d => d.Message.MessageType.StartsWith("Schedule") || d.Message.MessageType.StartsWith("schedule") || d.Message.MessageType.StartsWith("Appoint") || d.Message.MessageType.StartsWith("appoint"));
                var unreadDeptAnnouncement = await unreadDeptQuery.CountAsync(d => d.Message.MessageType.StartsWith("Announc") || d.Message.MessageType.StartsWith("announc") || d.Message.MessageType.StartsWith("Broad") || d.Message.MessageType.StartsWith("broad"));

                summaries.Add(new ConversationSummaryDto
                {
                    Id = deptId,
                    DisplayId = deptId,
                    Name = $"قسم {deptId}",
                    Type = "Department",
                    UnreadCount = unreadDeptCount,
                    UnreadChatCount = unreadDeptChat,
                    UnreadQuestionCount = unreadDeptQuestion,
                    UnreadScheduleCount = unreadDeptSchedule,
                    UnreadAnnouncementCount = unreadDeptAnnouncement,
                    LastMessage = new LastMessagePreviewDto
                    {
                        Text = ExtractTextPreview(lastDeptMsg.Payload),
                        Timestamp = DateTime.SpecifyKind(lastDeptMsg.CreatedAt, DateTimeKind.Utc),
                        Status = "Sent",
                        Type = lastDeptMsg.MessageType,
                        TargetType = lastDeptMsg.TargetType,
                        IsMe = lastDeptMsg.FromUserId == userId,
                        SenderId = lastDeptMsg.FromUserId
                    }
                });
            }

            return summaries.OrderByDescending(s => s.LastMessage?.Timestamp).ToList();

        }

        private string ExtractTextPreview(string payload)
        {
            if (string.IsNullOrEmpty(payload)) return "";
            try
            {
                // Try parse JSON
                if (payload.TrimStart().StartsWith("{"))
                {
                    var data = System.Text.Json.JsonDocument.Parse(payload);
                    if (data.RootElement.TryGetProperty("text", out var textProp))
                    {
                        return textProp.GetString() ?? "مرفق";
                    }
                    return "مرفق";
                }
                return payload;
            }
            catch
            {
                return payload;
            }
        }
    }
}
