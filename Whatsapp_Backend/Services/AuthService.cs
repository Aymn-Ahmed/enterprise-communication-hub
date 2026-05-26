using System;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Whatsapp_Backend.Data;

namespace Whatsapp_Backend.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    public async Task<LoginResponse?> LoginAsync(LoginRequest request)
    {
        var normalizedUsername = request.Username.Trim();
        var user = await _context.usersses
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Username != null && u.Username == normalizedUsername);

        if (user == null || string.IsNullOrWhiteSpace(user.PasswordHash))
            return null;

        var isValidPassword = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isValidPassword)
            return null;

        var role = string.IsNullOrWhiteSpace(user.UserRole) ? "User" : user.UserRole;
        var expiresMinutes = _configuration.GetValue<int>("Jwt:ExpiresMinutes");
        if (expiresMinutes <= 0) expiresMinutes = 480;
        var expiresAt = DateTime.UtcNow.AddMinutes(expiresMinutes);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.DisplayId.ToString()),
            new Claim("displayId", user.DisplayId.ToString()),
            new Claim(ClaimTypes.NameIdentifier, user.DisplayId.ToString()),
            new Claim(ClaimTypes.Role, role),
            new Claim("role", role),
            new Claim(JwtRegisteredClaimNames.UniqueName, user.Username ?? string.Empty)
        };

        var jwtKey = _configuration["Jwt:Key"] ?? string.Empty;
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "WhatsappBackend";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "WhatsappBackendClients";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: jwtIssuer,
            audience: jwtAudience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: creds
        );

        return new LoginResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAtUtc = expiresAt,
            DisplayId = user.DisplayId,
            Role = role,
            Username = user.Username ?? string.Empty,
            Name = user.nameuser ?? user.us_name ?? "User"
        };
    }
}
