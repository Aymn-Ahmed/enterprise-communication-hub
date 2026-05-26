# Integration Assumptions & Backend Dependencies

This file lists the current assumptions the frontend makes when integrated into a host/company environment.

## API Assumptions

- Backend is reachable at `VITE_HUB_API_BASE_URL` (or fallback `http://localhost:5270`).
- Responses include HTTP status codes with standard semantics (`200`, `401`, `403`, `404`, `405`).
- Login returns JWT token and user identity fields expected by `src/App.tsx`.
- Admin role/status endpoints may be unavailable in some deployments; frontend handles this with fallback messages.

## Auth Assumptions

- JWT is stored in `localStorage` under `smartdash_token`.
- User profile object is stored under `smartdash_user`.
- JWT may include role claim via:
  - `role`
  - `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`

## Role Assumptions

- Frontend role model: `admin | manager | employee`.
- UI permission mapping is frontend-side convenience only; backend remains source of truth.
- Sensitive operations still rely on backend authorization (`403` handling).

## Realtime Assumptions

- SignalR hub path defaults to `http://localhost:5270/chatHub` unless `VITE_HUB_SIGNALR_URL` overrides.
- Backend emits the event names documented in `REALTIME_CONTRACT.md`.
- Message/reaction typing payloads may vary slightly in key casing; hooks already normalize common variants.

## Storage / Config Assumptions

- Host allows `localStorage` access in browser runtime.
- `hub_api_base_url` is set at bootstrap by host app (`src/App.tsx` in dev host).

## Frontend Fallback Behaviors

- Unauthorized (`401`) => emits `hub:session-expired`; session is cleared in app shell.
- Network errors => emits `hub:network-error`; UI shows non-blocking notifications.
- Unsupported admin endpoints (`404/405`) => operation-specific guidance message, no crash.

