using System;

namespace Whatsapp_Backend.ModelsScaffold;

#pragma warning disable CS8981
public partial class userss
{
    public int DisplayId { get; set; }
    public string? Username { get; set; }
    public string? PasswordHash { get; set; }
    public string UserRole { get; set; } = "User";
    public string? nameuser { get; set; }
    public string? us_name { get; set; }
    public int WorkId { get; set; }
    public string? AvatarUrl { get; set; }
    public string? CoverUrl { get; set; }
    public DateTime? LastActiveAt { get; set; }
}
#pragma warning restore CS8981
