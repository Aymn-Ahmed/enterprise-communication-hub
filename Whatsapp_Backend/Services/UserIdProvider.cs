using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace Whatsapp_Backend.Services
{
    /// <summary>
    /// Provider لاستخراج UserId من SignalR connection
    /// يستخدم Internal ID (Id) من JWT token كـ UserId
    /// </summary>
    public class UserIdProvider : IUserIdProvider
    {
        public string GetUserId(HubConnectionContext connection)
        {
            // ✅ Prioritize displayId to match messaging system (DisplayId is used as string ID)
            var userIdClaim = connection.User?.FindFirst("displayId")?.Value
                ?? connection.User?.FindFirst("Id")?.Value
                ?? connection.User?.FindFirst("id")?.Value
                ?? connection.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? connection.User?.FindFirst("sub")?.Value;
            
            if (!string.IsNullOrEmpty(userIdClaim))
            {
                return userIdClaim;
            }
            
            // ✅ Fallback: استخدام ConnectionId (للتطوير فقط)
            // ✅ في Production، يجب أن يكون UserId موجوداً في Claims
            System.Diagnostics.Debug.WriteLine($"[UserIdProvider] ⚠️ WARNING: UserId (Internal ID) not found in Claims, using ConnectionId: {connection.ConnectionId}");
            System.Diagnostics.Debug.WriteLine($"[UserIdProvider] Available Claims: {string.Join(", ", connection.User?.Claims.Select(c => $"{c.Type}={c.Value}") ?? Array.Empty<string>())}");
            return connection.ConnectionId;
        }
    }
}

