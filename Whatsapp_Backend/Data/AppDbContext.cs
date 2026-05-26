using Microsoft.EntityFrameworkCore;
using Whatsapp_Backend.ModelsScaffold;

namespace Whatsapp_Backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Message> Messages { get; set; } = null!;
    public DbSet<MessageDelivery> MessageDeliveries { get; set; } = null!;
    public DbSet<MessageReaction> MessageReactions { get; set; } = null!;
    public DbSet<Appointment> Appointments { get; set; } = null!;
    public DbSet<userss> usersses { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // MessageDeliveries indexes
        modelBuilder.Entity<MessageDelivery>()
            .HasIndex(x => new { x.UserId, x.IsRead });
        modelBuilder.Entity<MessageDelivery>()
            .HasIndex(x => x.MessageId);
        modelBuilder.Entity<MessageDelivery>()
            .HasIndex(x => new { x.UserId, x.MessageId });

        // Messages indexes
        modelBuilder.Entity<Message>()
            .HasIndex(x => x.FromUserId);
        modelBuilder.Entity<Message>()
            .HasIndex(x => x.CreatedAt);
        modelBuilder.Entity<Message>()
            .HasIndex(x => x.MessageType);
        modelBuilder.Entity<Message>()
            .HasIndex(x => new { x.TargetType, x.TargetId });

        // MessageReactions indexes
        modelBuilder.Entity<MessageReaction>()
            .HasIndex(x => x.MessageId);
        modelBuilder.Entity<MessageReaction>()
            .HasIndex(x => new { x.UserId, x.MessageId });

        // Required for EF model building at design-time
        modelBuilder.Entity<userss>()
            .HasKey(x => x.DisplayId);
        modelBuilder.Entity<userss>()
            .Property(x => x.Username)
            .HasMaxLength(100);
        modelBuilder.Entity<userss>()
            .Property(x => x.PasswordHash)
            .HasMaxLength(255);
        modelBuilder.Entity<userss>()
            .Property(x => x.UserRole)
            .HasMaxLength(20)
            .HasDefaultValue("User");
        modelBuilder.Entity<userss>()
            .HasIndex(x => x.Username)
            .IsUnique();
    }
}
