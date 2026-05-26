using System.ComponentModel.DataAnnotations;

namespace Whatsapp_Backend.Models
{
    public class ReactionRequest
    {
        [Required]
        [MaxLength(20)]
        public string ReactionType { get; set; } = string.Empty;
    }
}