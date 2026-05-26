using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.ModelsScaffold;

namespace Whatsapp_Backend.Services
{
    public class MessageReactionService
    {
        private readonly AppDbContext _context;

        public MessageReactionService(AppDbContext context)
        {
            _context = context;
        }

        public async Task ToggleReaction(int messageId, int userId, string reactionType)
        {
            var existingReaction = await _context.MessageReactions
                .FirstOrDefaultAsync(r => r.MessageId == messageId && r.UserId == userId);

            if (existingReaction == null)
            {
                var reaction = new MessageReaction
                {
                    MessageId = messageId,
                    UserId = userId,
                    ReactionType = reactionType,
                    CreatedAt = DateTime.UtcNow
                };

                _context.MessageReactions.Add(reaction);
            }
            else if (existingReaction.ReactionType == reactionType)
            {
                _context.MessageReactions.Remove(existingReaction);
            }
            else
            {
                existingReaction.ReactionType = reactionType;
            }

            await _context.SaveChangesAsync();
        }
    }
}