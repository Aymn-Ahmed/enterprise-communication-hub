using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.Data;

namespace Whatsapp_Backend.Services
{
    public class RecipientResolver : IRecipientResolver
    {
        private readonly AppDbContext _context;

        public RecipientResolver(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<int>> GetRecipientIds(string targetType, string targetId)
        {
            var recipientIds = new List<int>();

            if (targetType == "User")
            {
                if (targetId.Contains(","))
                {
                    var ids = targetId.Split(',', StringSplitOptions.RemoveEmptyEntries);
                    foreach (var id in ids)
                    {
                        if (int.TryParse(id, out int val)) recipientIds.Add(val);
                    }
                }
                else
                {
                    if (int.TryParse(targetId, out int val)) recipientIds.Add(val);
                }
            }
            else if (targetType == "Department")
            {
                if (int.TryParse(targetId, out int deptId))
                {
                    // Department filtering using WorkId
                    var usersInDept = await _context.usersses
                        .AsNoTracking()
                        .Where(u => u.WorkId == deptId && u.DisplayId > 0)
                        .Select(u => u.DisplayId)
                        .ToListAsync();
                    
                    recipientIds.AddRange(usersInDept);
                }
            }
            else if (targetType == "Global")    
            {
                var allUsers = await _context.usersses
                    .AsNoTracking()
                    .Where(u => u.DisplayId > 0)
                    .Select(u => u.DisplayId)
                    .ToListAsync();
                
                recipientIds.AddRange(allUsers);
            }

            return recipientIds.Distinct().ToList();
        }
    }
}
