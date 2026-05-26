# Communication Hub - Migration Guide

## 1. Setup Instructions
To integrate this module into a new .NET + React project:

### 1.1 Backend Configuration (Program.cs / Startup.cs)
Register SignalR and the services in the dependency injection container:

```csharp
// 🛡️ SignalR
builder.Services.AddSignalR();
builder.Services.AddSingleton<IUserIdProvider, UserIdProvider>();

// 🧠 Services
builder.Services.AddScoped<IMessageDispatchService, MessageDispatchService>();
builder.Services.AddScoped<IConversationService, ConversationService>();
builder.Services.AddScoped<MessageReactionService>();
builder.Services.AddScoped<IRecipientResolver, RecipientResolver>();

// 🛣️ Hub Mapping
app.MapHub<ChatHub>("/chatHub");
```

### 1.2 Frontend Dependencies
Run the following in your ClientApp folder:
```bash
npm install @microsoft/signalr framer-motion react-icons lucide-react react-leaflet leaflet lodash
```

### 1.3 Database Setup
Ensure your DbContext handles the following entities:
- Message
- MessageDelivery
- MessageReaction
- Appointment (if using appointment scheduling)

## 2. Directory Structure
- /Frontend/ - Contains components, hooks, and services for React.
- /Backend/ - Contains C# controllers, hubs, and services.

Note: Remember to update namespaces (e.g., SmartDashboard) to match your new project's name.
