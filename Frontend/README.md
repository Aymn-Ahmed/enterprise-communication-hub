# Communication Hub Frontend

Internal communication frontend module (chat + admin operations) designed to be integrated into a host React application.

## Project Overview

This module provides:
- Realtime communication widget (private chat, departments, announcements, reactions, typing)
- Admin dashboard operations (user list, department updates, role/status actions when backend supports them)
- Host integration adapters for API/auth/storage/realtime

The code is optimized for incremental hardening and integration readiness (not a monolithic redesign).

## Features

- Authentication bootstrap via JWT token
- Conversation list + message timeline + message actions
- Realtime updates through SignalR adapter
- Uploads (attachments/avatar/cover) including progress path
- Admin role-based visibility and guarded actions
- Session/network global events (`hub:session-expired`, `hub:network-error`)

## Architecture (High Level)

- **Entry points**: `index.ts`, `integration/index.ts`
- **Core adapters**: `core/integration/*`, `core/api/*`, `core/realtime/*`
- **Feature module**: `features/communication-hub/*`
- **Dev host shell**: `src/App.tsx` + `src/components/*`

## Tech Stack

- React + TypeScript
- Vite
- SignalR client (`@microsoft/signalr`)
- Vitest + Testing Library (critical flow tests)

## Environment Setup

Copy `.env.example` to `.env` and adjust values:

- `VITE_HUB_API_BASE_URL` (default: `http://localhost:5270`)
- `VITE_HUB_SIGNALR_URL` (default: `http://localhost:5270/chatHub`)
- `VITE_HUB_ENABLE_ADMIN_DASHBOARD` (default: `true`)
- `VITE_API_BASE_URL` (legacy optional usage)

Fallback behavior is safe if values are missing (see `core/config/runtimeConfig.ts`).

## Install & Run

```bash
npm install
npm run dev
```

## Build & Test Commands

```bash
npm run build
npm run test
npm run test:watch
npm run preview
```

## Host Integration (Minimal)

```ts
import { configureCommunicationHub, CommunicationHubWidget } from './CommunicationHub_Module/Frontend';

configureCommunicationHub({
  apiClient: yourApiClient,
  auth: { useAuthUserHook: yourAuthHook }, // optional
  useSignalRHook: yourSignalRHook, // optional
  storage: yourStorageAdapter // optional
});
```

Render widget:

```tsx
<CommunicationHubWidget open={open} onClose={onClose} onCountsUpdate={setCounts} />
```

## Contracts & Integration Docs

- [API contract](./docs/API_CONTRACT.md)
- [Realtime contract](./docs/REALTIME_CONTRACT.md)
- [Integration assumptions](./docs/INTEGRATION_ASSUMPTIONS.md)
- [Demo scenario](./docs/DEMO_SCENARIO.md)
- [Screenshots guide](./docs/SCREENSHOTS.md)
- [Delivery checklist](./docs/DELIVERY_CHECKLIST.md)

## Screenshots

- Follow the capture plan: [docs/SCREENSHOTS.md](./docs/SCREENSHOTS.md)
- Store image files in `docs/screenshots/`:
  - `01-login.png`
  - `02-conversations.png`
  - `03-realtime-chat.png`
  - `04-typing-indicator.png`
  - `05-admin-dashboard.png`
  - `06-role-management.png`

## Known Limitations

- Some admin endpoints (`/role`, `/status`) may be unavailable on older backends; frontend handles `404/405`.
- Bundle size warning exists in production build (tracked as technical debt).
- Frontend role guards improve UX but backend authorization remains source of truth.

## Future Improvements (Post-Delivery)

- Advanced product analytics dashboard
- Expanded end-to-end browser tests
- Optional bundle splitting strategy once integration baseline is stable
