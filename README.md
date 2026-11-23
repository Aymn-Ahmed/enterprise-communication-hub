# 🚀 Enterprise Communication Hub

> **Pluggable Real-Time Employee Messaging Module for ERP, HRMS & Admin Dashboards**

![TypeScript](https://img.shields.io/badge/TypeScript-83.8%25-3178C6?style=flat-square)
![C#](https://img.shields.io/badge/C%23-15.5%25-512BD4?style=flat-square)
![ASP.NET Core](https://img.shields.io/badge/ASP.NET%20Core-SignalR-5C2D91?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-success?style=flat-square)

---

## 📋 Overview

**Enterprise Communication Hub** is a standalone, pluggable real-time communication module engineered to integrate seamlessly into existing **ERP systems**, **HRMS platforms**, performance evaluation tools, and administrative dashboards.

Instead of rebuilding internal messaging from scratch inside every business application, this module provides a decoupled **ASP.NET Core + SignalR** backend service paired with an embeddable **React + TypeScript** widget—enabling organizations to launch 1-to-1 chats, department channels, official announcements, and media sharing while reusing their host application's authentication and user directory.

---
## 📸 Screenshots

<img width="1280" height="720" alt="4" src="https://github.com/user-attachments/assets/b790c4aa-0ce0-492a-84d0-34a7155cc22b" />
<img width="1280" height="720" alt="2" src="https://github.com/user-attachments/assets/2b7386de-2b4d-4a4a-9602-ceb45f84ccb8" />
<img width="1280" height="720" alt="3" src="https://github.com/user-attachments/assets/a505ba24-cd18-44f1-8b5f-d47d73531dfb" />

## ✨ Key Features

### 💬 Real-Time Messaging
- **Private Messaging (1-to-1):** Instant direct messaging between employees.
- **Department & Group Channels:** Structured discussion channels mapped to organizational departments.
- **Official Announcements:** Broadcast administrative notices to the entire organization or targeted departments.
- **Live Presence & Interactions:** Real-time Online/Offline user status, typing indicators, and message reactions.

### 📤 File & Media Management
- **Document & Media Sharing:** Upload and download files, images, and videos with upload progress tracking.
- **User Avatars:** Built-in profile picture management for employees.

### 👥 Administration & HR Integration
- **Employee & Department Management:** Organize users by departments, job roles, and availability statuses.
- **Role-Based Access Control (RBAC):** Separate administrative controls from standard employee permissions.
- **External ERP/HR Sync:** RESTful endpoints designed to import and synchronize employee records from external host systems.

### 🔐 Security & Reliability
- **JWT Bearer Authentication:** Token-based authorization securing both REST endpoints and SignalR WebSocket connections.
- **Automatic Reconnection:** Built-in SignalR connection recovery and state synchronization on network drops.

---

## 🏗️ Use Cases

- **Enterprise Resource Planning (ERP):** Add internal employee and department messaging directly inside operational workflows.
- **Human Resource Management Systems (HRMS):** Centralize company-wide announcements and HR communication.
- **Performance & Evaluation Portals:** Enable direct manager-to-employee feedback and team coordination.
- **Administrative Dashboards:** Drop-in communication widget without modifying core host business logic.

---

## 🛠️ Tech Stack

### Frontend
- **React & TypeScript:** Type-safe, modular UI widget architecture
- **Vite:** Fast development server and optimized production bundling
- **SignalR Client (`@microsoft/signalr`):** Bi-directional real-time WebSocket event handling

### Backend
- **C# & ASP.NET Core Web API:** RESTful APIs with clean service separation
- **SignalR Server:** Real-time messaging hub and presence tracking
- **Entity Framework Core & SQL Server / PostgreSQL:** Relational persistence for messages, users, and files

### Architecture
- **Modular Pluggable Design:** Decoupled from host application business logic
- **RESTful APIs & WebSockets:** Hybrid request/response and real-time event architecture

---

## 🚀 Quick Start

### Prerequisites
- [.NET 8 / 9 SDK](https://dotnet.microsoft.com/)
- [Node.js 18+](https://nodejs.org/)
- SQL Server or PostgreSQL

### Installation & Running

#### 1. Backend Service
```bash
cd Whatsapp_Backend
dotnet restore
dotnet build
dotnet run
```

#### 2. Frontend Widget
```bash
cd Frontend
npm install
npm run dev
```

### Environment Configuration

Configure the required environment variables for local development:

```env
# Frontend (.env)
VITE_HUB_API_BASE_URL=http://localhost:5270
VITE_HUB_SIGNALR_URL=http://localhost:5270/chatHub
VITE_HUB_ENABLE_ADMIN_DASHBOARD=true

# Backend (appsettings.json / Environment Variables)
ConnectionStrings__DefaultConnection=Server=localhost;Database=CommunicationHub;User Id=sa;Password=YourStrongPassword;TrustServerCertificate=True;
JwtSecret=YOUR_SECURE_SECRET_KEY
SignalRHubUrl=http://localhost:5270/chatHub
```

---

## 📚 Application Integration Guide

The frontend widget decouples authentication, API calls, and local storage through configurable adapters so the host ERP/HRMS retains full control over user sessions:

### Step 1: Import the Module

```typescript
import { 
  configureCommunicationHub, 
  CommunicationHubWidget 
} from './CommunicationHub_Module/Frontend';
```

### Step 2: Configure the Service

```typescript
configureCommunicationHub({
  // Host application's API client
  apiClient: yourApiClient,
  
  // Existing authentication hook
  auth: { 
    useAuthUserHook: yourAuthHook 
  },
  
  // SignalR connection hook
  useSignalRHook: yourSignalRHook,
  
  // Storage adapter
  storage: yourStorageAdapter
});
```

### Step 3: Embed the Communication Widget

```tsx
import { useState } from 'react';
import { CommunicationHubWidget } from './CommunicationHub_Module/Frontend';

export function YourApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [counts, setCounts] = useState<{ unread?: number }>({});

  return (
    <div>
      {/* Host Application Content */}
      
      {/* Communication Widget */}
     <CommunicationHubWidget 
        open={isOpen} 
        onClose={() => setIsOpen(false)}
        onCountsUpdate={setCounts}
      />
      
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)}>
        💬 Messages ({counts.unread || 0})
      </button>
    </div>
  );
}
```

---

## 🔌 Core API Endpoints

### Conversations & Messages
- `GET /api/conversations` — Retrieve user conversations
- `POST /api/conversations` — Create a new private or group conversation
- `GET /api/conversations/{id}/messages` — Retrieve conversation message history
- `POST /api/conversations/{id}/messages` — Send a new message

### Employees, Departments & Announcements
- `GET /api/employees` — List all employees
- `POST /api/employees` — Register or sync a new employee
- `PUT /api/employees/{id}` — Update employee details
- `DELETE /api/employees/{id}` — Remove an employee record
- `GET /api/departments` — Retrieve organizational departments
- `GET /api/announcements` — Fetch official administrative announcements

### Roles & Permissions (RBAC)
- `GET /api/roles` — List available system roles
- `POST /api/roles` — Create a new access role
- `PUT /api/users/{id}/role` — Assign a role to an employee

### Files & Attachments
- `POST /api/files/upload` — Upload a document or media attachment
- `GET /api/files/{id}/download` — Download a shared file
- `DELETE /api/files/{id}` — Delete an uploaded file

---

## 📞 Contact & Support

**Aymen Ahmed Al-Rajwi** — Full-Stack Software Engineer (.NET & React)

- 📧 **Email:** ymn85610@gmail.com
- 💼 **LinkedIn:** [linkedin.com/in/aymen-alrjwy](https://linkedin.com/in/aymen-alrjwy)
- 🌐 **Portfolio:** [aymanfullstack.netlify.app](https://aymanfullstack.netlify.app)
- 💬 **Issues:** [GitHub Issues](https://github.com/Aymn-Ahmed/enterprise-communication-hub/issues)

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
