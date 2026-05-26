using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Whatsapp_Backend.ModelsScaffold
{
    public class MessageDelivery
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int MessageId { get; set; }

        [ForeignKey("MessageId")]
        public virtual Message Message { get; set; } = null!;

        [Required]
        public int UserId { get; set; } // Recipient User ID (DisplayId)

        public bool IsRead { get; set; } = false;

        public DateTime? ReadAt { get; set; }

        public DateTime? DeliveredAt { get; set; }

        [MaxLength(20)]
        public string Status { get; set; } = "Sent"; // Sent, Delivered, Read
    }
}
