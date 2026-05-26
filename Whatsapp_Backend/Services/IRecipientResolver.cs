using System.Collections.Generic;
using System.Threading.Tasks;

namespace Whatsapp_Backend.Services
{
    public interface IRecipientResolver
    {
        Task<List<int>> GetRecipientIds(string targetType, string targetId);
    }
}
