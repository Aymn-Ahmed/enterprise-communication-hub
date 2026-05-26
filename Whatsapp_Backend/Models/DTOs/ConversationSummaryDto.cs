using System;

namespace Whatsapp_Backend.Models.DTOs
{
    public class ConversationSummaryDto
    {
        public int Id { get; set; }
        public int? DisplayId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int WorkId { get; set; }
        public string? Type { get; set; } // User, Global, Department
        public string? AvatarUrl { get; set; }
        public string? CoverUrl { get; set; }
        public LastMessagePreviewDto? LastMessage { get; set; }
        public int UnreadCount { get; set; }
        public int UnreadChatCount { get; set; }
        public int UnreadQuestionCount { get; set; }
        public int UnreadScheduleCount { get; set; }
        public int UnreadAnnouncementCount { get; set; }
        public DateTime? LastActiveAt { get; set; }
    }

    public class LastMessagePreviewDto
    {
        public string Text { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; }
        public string? Status { get; set; } // Sent, Delivered, Read
        public string? Type { get; set; }   // Text, Image, Audio, etc.
        public string? TargetType { get; set; } // User, Department, Global
        public bool IsMe { get; set; }
        public int SenderId { get; set; }
    }
}
