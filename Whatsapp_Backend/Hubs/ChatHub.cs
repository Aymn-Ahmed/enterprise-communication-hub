using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;
using System.Collections.Concurrent;
using System.Linq;
using System;
using Microsoft.AspNetCore.Authorization;
using Whatsapp_Backend.Data;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;

namespace Whatsapp_Backend.Hubs
{
    [Authorize]
    public class ChatHub : Hub
    {
        private readonly IServiceProvider _serviceProvider;

        // Tracks userId -> set of connectionIds
        public static readonly ConcurrentDictionary<string, ConcurrentDictionary<string, byte>> _onlineUsers =
            new ConcurrentDictionary<string, ConcurrentDictionary<string, byte>>();

        public ChatHub(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                var connections = _onlineUsers.GetOrAdd(userId, _ => new ConcurrentDictionary<string, byte>());
                bool isFirstConnection = connections.IsEmpty;
                connections.TryAdd(Context.ConnectionId, 0);

                // Add to user-specific group for targeted notifications (like typing)
                await Groups.AddToGroupAsync(Context.ConnectionId, $"User_{userId}");

                if (isFirstConnection)
                {
                    Console.WriteLine($"[ChatHub] Broadcaster: User {userId} is now Online.");
                    await Clients.All.SendAsync("UserOnline", userId);
                    await UpdateLastActive(userId);
                    await MarkSentMessagesAsDelivered(userId);
                }

                // Send current online users to THE NEWLY CONNECTED user
                var onlineUserIds = _onlineUsers.Keys.ToArray();
                await Clients.Caller.SendAsync("InitialOnlineUsers", onlineUserIds);
            }

            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                if (_onlineUsers.TryGetValue(userId, out var connections))
                {
                    connections.TryRemove(Context.ConnectionId, out _);

                    if (connections.IsEmpty)
                    {
                        // Remove the user from the dictionary only if they have no more connections
                        _onlineUsers.TryRemove(userId, out _);
                        await Clients.All.SendAsync("UserOffline", userId);
                        await UpdateLastActive(userId);
                    }
                }
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task Ping()
        {
            var userId = Context.UserIdentifier;
            if (!string.IsNullOrEmpty(userId))
            {
                await UpdateLastActive(userId);
            }
        }

        private async Task UpdateLastActive(string userId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                if (int.TryParse(userId, out int id))
                {
                    var user = await db.usersses.FirstOrDefaultAsync(u => u.DisplayId == id);
                    if (user != null)
                    {
                        user.LastActiveAt = DateTime.UtcNow;
                        await db.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                // Log error if needed, but don't break the Hub
                Console.WriteLine($"Error updating LastActiveAt for user {userId}: {ex.Message}");
            }
        }

        private async Task MarkSentMessagesAsDelivered(string userId)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                if (!int.TryParse(userId, out int numericUserId)) return;

                // ✅ Use join instead of Include to avoid circular reference / serialization issues
                var pendingDeliveries = await (
                    from d in db.MessageDeliveries
                    join m in db.Messages on d.MessageId equals m.Id
                    where d.UserId == numericUserId && d.Status == "Sent"
                    select new { Delivery = d, SenderUserId = m.FromUserId }
                ).ToListAsync();

                if (pendingDeliveries.Any())
                {
                    var now = DateTime.UtcNow;
                    foreach (var item in pendingDeliveries)
                    {
                        item.Delivery.Status = "Delivered";
                        item.Delivery.DeliveredAt = now;

                        // ✅ Notify the original sender (safe object - no circular refs)
                        await Clients.Group($"User_{item.SenderUserId}").SendAsync("MessageDelivered", new
                        {
                            MessageId = item.Delivery.MessageId,
                            RecipientId = userId,
                            DeliveredAt = now.ToString("yyyy-MM-ddTHH:mm:ssZ")
                        });
                    }
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error marking messages as delivered for user {userId}: {ex.Message}");
            }
        }

        public async Task NotifyTyping(string targetUserId, bool isTyping)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(targetUserId)) return;

            // Send to the target user's personal group
            await Clients.Group($"User_{targetUserId}").SendAsync("UserTyping", userId, userId, isTyping);
        }

        public async Task NotifyRecordingStatus(string targetId, string status)
        {
            var userId = Context.UserIdentifier;
            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(targetId)) return;

            // If targetId starts with Dept_ or Global_, it's a room. Otherwise it's a User ID.
            if (targetId.StartsWith("Dept_") || targetId.StartsWith("Global_") || targetId.StartsWith("DeptChat_"))
            {
                await Clients.Group(targetId).SendAsync("UserRecording", userId, targetId, status);
            }
            else
            {
                // Send to the target user's personal group
                await Clients.Group($"User_{targetId}").SendAsync("UserRecording", userId, userId, status);
            }
        }

        public async Task JoinChatRoom(string chatId)
        {
            // For group chats/departments, users still join shared groups
            await Groups.AddToGroupAsync(Context.ConnectionId, chatId);
        }

        public async Task LeaveChatRoom(string chatId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, chatId);
        }

        public async Task JoinGlobalChannel()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "GlobalChannel");
        }

        public async Task JoinDepartmentChannel(int deptId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Dept_{deptId}");
        }

        public async Task JoinDepartmentChat(int deptId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"DeptChat_{deptId}");
        }
    }
}
