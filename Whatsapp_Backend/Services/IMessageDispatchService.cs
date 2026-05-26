using System.Threading.Tasks;
using System.Collections.Generic; // Added for List<int>
using System.ComponentModel.DataAnnotations;

namespace Whatsapp_Backend.Services
{
    public class MessageRequest
    {
        [Range(1, int.MaxValue)]
        public int FromUserId { get; set; }

        [Required]
        [MaxLength(20)]
        public string? TargetType { get; set; } // User, Department

        [Required]
        [MaxLength(250)]
        public string? TargetId { get; set; }

        [Required]
        [MaxLength(50)]
        public string? MessageType { get; set; } // Question, Schedule, Announcement, Chat

        [Required]
        [MaxLength(10000)]
        public string? Payload { get; set; }
    }

    public class MessageUpdateRequest
    {
        [Required]
        [MaxLength(10000)]
        public string? Payload { get; set; }
    }

    public class BatchReadResult 
    {
        public List<int> ReadDeliveryIds { get; set; } = new();
        public List<ReadNotificationDto> Notifications { get; set; } = new(); 
        public DateTime ReadAt { get; set; }
    }

    public class ReadNotificationDto 
    {
        public int SenderId { get; set; }
        public int MessageId { get; set; }
        public int RecipientId { get; set; }
    }

    public interface IMessageDispatchService
    {
        Task Dispatch(MessageRequest request);
        Task UpdateMessage(int id, string payload);
        Task<BatchReadResult> MarkMessagesAsReadAsync(int displayId, List<int> deliveryIds, System.Threading.CancellationToken ct);
    }
}
