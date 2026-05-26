namespace Whatsapp_Backend.Models
{
    public class ReactionSummaryDto
    {
        public string ReactionType { get; set; } = string.Empty;
        public int Count { get; set; }
        public bool IsReactedByMe { get; set; }
    }
}
