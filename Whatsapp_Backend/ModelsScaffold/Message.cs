using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Whatsapp_Backend.ModelsScaffold
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int FromUserId { get; set; } // Sender's DisplayId

        [Required]
        [MaxLength(50)]
        public string MessageType { get; set; } = string.Empty; // Question, Schedule, Announcement, Chat

        [Required]
        public string Payload { get; set; } = string.Empty; // Message text or JSON for attachments

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        [MaxLength(20)]
        public string TargetType { get; set; } = string.Empty; // User, Department, Global

        [Required]
        public string TargetId { get; set; } = string.Empty; // Can be "101" or "101,102" or Department DisplayId

        public virtual ICollection<MessageDelivery> Deliveries { get; set; } = new List<MessageDelivery>();

        public virtual ICollection<MessageReaction> Reactions { get; set; } = new List<MessageReaction>();
    }
}
