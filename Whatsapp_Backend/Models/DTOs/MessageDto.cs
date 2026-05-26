using System;

namespace Whatsapp_Backend.Models.DTOs
{
    public class MessageDto
    {
        public int Id { get; set; }
        public string Payload { get; set; } = string.Empty;
        public string Text { get; set; } = string.Empty;
        public string MessageType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public int FromUserId { get; set; }
        public string TargetType { get; set; } = string.Empty;
        public string TargetId { get; set; } = string.Empty;
        public string FromUserName { get; set; } = string.Empty;
        public int RecipientsCount { get; set; }
        public int ReadCount { get; set; }
        public bool IsReadByMe { get; set; }
    }
}
