using System;

namespace Whatsapp_Backend.Models
{
    public class ReactionDetailDto
    {
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string ReactionType { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
