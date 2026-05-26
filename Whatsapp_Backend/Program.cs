using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Whatsapp_Backend.Data;
using Whatsapp_Backend.Hubs;
using Whatsapp_Backend.ModelsScaffold;
using Whatsapp_Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// 
// إضافة سياسة السماح للفرونت إند
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174"
            ) // روابط Vite dev المتوقعة
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});
builder.Services.AddControllers();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        var jwtKey = builder.Configuration["Jwt:Key"] ?? string.Empty;
        var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "WhatsappBackend";
        var jwtAudience = builder.Configuration["Jwt:Audience"] ?? "WhatsappBackendClients";

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateIssuerSigningKey = true,
            ValidateLifetime = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ClockSkew = TimeSpan.Zero
        };

        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;
                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/chatHub"))
                {
                    context.Token = accessToken;
                }
                return Task.CompletedTask;
            }
        };
    });
builder.Services.AddAuthorization();

// 🛡️ SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, UserIdProvider>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection") ?? "Data Source=communicationhub.db"));

// 🧠 Services
builder.Services.AddScoped<IMessageDispatchService, MessageDispatchService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<MessageReactionService>();
builder.Services.AddScoped<IRecipientResolver, RecipientResolver>();
builder.Services.AddScoped<IAuthService, AuthService>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.Migrate();

    const string adminUsername = "admin";
    const string adminPassword = "admin123";

    var existingAdmin = db.usersses.FirstOrDefault(u => u.Username == adminUsername);
    if (existingAdmin is null)
    {
        var nextDisplayId = (db.usersses.Max(u => (int?)u.DisplayId) ?? 0) + 1;
        db.usersses.Add(new userss
        {
            DisplayId = nextDisplayId,
            Username = adminUsername,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword),
            UserRole = "Admin",
            nameuser = "System Admin",
            us_name = "admin",
            WorkId = 0,
            LastActiveAt = DateTime.UtcNow
        });
        db.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseStaticFiles();
app.UseCors("AllowFrontend"); // تفعيل السياسة التي أنشأناها فوق
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// 🛣️ Hub Mapping
app.MapHub<ChatHub>("/chatHub");

app.Run();
