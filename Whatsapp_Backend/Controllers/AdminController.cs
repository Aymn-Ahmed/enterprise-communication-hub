using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.Hubs;
using Whatsapp_Backend.Models.DTOs;

namespace Whatsapp_Backend.Controllers;

public class AdminUserItemDto
{
    public int DisplayId { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public int WorkId { get; set; }
    public bool IsOnline { get; set; }
    public DateTime? LastActiveAt { get; set; }
}

public class UpdateUserDepartmentRequest
{
    public int WorkId { get; set; }
}

public class UpdateUserRoleRequest
{
    public string Role { get; set; } = "User";
}

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _context;

    public AdminController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers([FromQuery] int page = 1, [FromQuery] int pageSize = 50, [FromQuery] string? search = null)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize < 1 ? 1 : (pageSize > 200 ? 200 : pageSize);

        var query = _context.usersses.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.Trim();
            query = query.Where(u =>
                (u.Username != null && EF.Functions.Like(u.Username, $"%{term}%")) ||
                (u.nameuser != null && EF.Functions.Like(u.nameuser, $"%{term}%")) ||
                (u.us_name != null && EF.Functions.Like(u.us_name, $"%{term}%")));
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderBy(u => u.DisplayId)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(u => new AdminUserItemDto
            {
                DisplayId = u.DisplayId,
                Username = u.Username ?? string.Empty,
                Name = u.nameuser ?? u.us_name ?? "مستخدم",
                Role = string.IsNullOrWhiteSpace(u.UserRole) ? "User" : u.UserRole,
                WorkId = u.WorkId,
                LastActiveAt = u.LastActiveAt,
                IsOnline = false
            })
            .ToListAsync();

        foreach (var user in users)
        {
            user.IsOnline = ChatHub._onlineUsers.ContainsKey(user.DisplayId.ToString());
        }

        var result = new PagedResult<AdminUserItemDto>
        {
            Items = users,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return Ok(result);
    }

    [HttpPut("users/{displayId:int}/department")]
    public async Task<IActionResult> UpdateUserDepartment(int displayId, [FromBody] UpdateUserDepartmentRequest request)
    {
        if (request.WorkId < 0) return BadRequest("WorkId must be zero or positive.");

        var user = await _context.usersses.FirstOrDefaultAsync(u => u.DisplayId == displayId);
        if (user == null) return NotFound();

        user.WorkId = request.WorkId;
        await _context.SaveChangesAsync();

        return Ok(new { success = true, displayId, workId = user.WorkId });
    }

    [HttpPut("users/{displayId:int}/role")]
    public async Task<IActionResult> UpdateUserRole(int displayId, [FromBody] UpdateUserRoleRequest request)
    {
        var normalizedRole = (request.Role ?? string.Empty).Trim();
        if (!string.Equals(normalizedRole, "Admin", StringComparison.OrdinalIgnoreCase) &&
            !string.Equals(normalizedRole, "User", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Role must be either 'Admin' or 'User'.");
        }

        var user = await _context.usersses.FirstOrDefaultAsync(u => u.DisplayId == displayId);
        if (user == null) return NotFound();

        user.UserRole = string.Equals(normalizedRole, "Admin", StringComparison.OrdinalIgnoreCase) ? "Admin" : "User";
        await _context.SaveChangesAsync();

        return Ok(new { success = true, displayId, role = user.UserRole });
    }
}
