using System.Collections.Generic;
using System.Threading.Tasks;
using Whatsapp_Backend.Models.DTOs;

namespace Whatsapp_Backend.Services
{
    public interface IConversationService
    {
        Task<List<ConversationSummaryDto>> GetConversationsAsync(int userId);
    }
}
