# API Contract (Frontend Expectations)

This document describes the current API assumptions used by the frontend module.
It is intentionally lightweight (non-Swagger) and based on current implementation.

## Authentication

### `POST /api/auth/login`
- **Auth**: none
- **Request body**
  - `username: string`
  - `password: string`
- **Success response (200)**
  - `token: string` (JWT)
  - `expiresAtUtc: string`
  - `displayId: number`
  - `role: string`
  - `username: string`
  - `name: string`
- **Used by**: `src/App.tsx`
- **Common errors**
  - 401/400: invalid credentials
  - network failure: frontend shows login error

## Admin Endpoints

### `GET /api/admin/users?page={page}&pageSize={pageSize}&search={search}`
- **Auth**: Bearer token required
- **Expected roles**: admin/manager (based on backend policy)
- **Response (200)**
  - `items: AdminUserItem[]`
  - `page: number`
  - `pageSize: number`
  - `totalCount: number`
- **Item fields used by frontend**
  - `displayId, username, name, role, workId, isOnline, isActive?, lastActiveAt?`
- **Common errors**
  - 401: session expired
  - 403: forbidden for role

### `PUT /api/admin/users/{displayId}/department`
- **Auth**: Bearer
- **Request body**
  - `workId: number`
- **Response**: generic success (`2xx`)
- **Common errors**: 401/403

### `PUT /api/admin/users/{displayId}/role`
- **Auth**: Bearer
- **Request body**
  - `role: string` (`admin|manager|employee` expected by frontend)
- **Response**: generic success (`2xx`)
- **Compatibility note**
  - If backend does not support this endpoint, frontend handles `404/405` gracefully.

### `PUT /api/admin/users/{displayId}/status`
- **Auth**: Bearer
- **Request body**
  - `isActive: boolean`
- **Response**: generic success (`2xx`)
- **Compatibility note**
  - If backend does not support this endpoint, frontend handles `404/405` gracefully.

## Messaging & Conversation Endpoints (Core)

Used through `features/communication-hub/services/hubService.ts`.

### Conversation & counts
- `GET /api/messages/counts`
- `GET /api/messages/my-deliveries`
- `GET /api/messages/conversations`
- `GET /api/messages/all?messageType={type}`

### Message actions
- `POST /api/messages/dispatch`
- `PUT /api/messages/{id}`
- `DELETE /api/messages/delete/{id}`
- `POST /api/messages/forward`
- `POST /api/messages/mark-read`
- `POST /api/messages/mark-read/{deliveryId}`
- `POST /api/messages/mark-read-batch`
- `POST /api/messages/mark-delivered-batch`
- `POST /api/messages/mark-read-conversation`

### Reactions
- `POST /api/messages/{messageId}/reaction?userId={userId}`
- `GET /api/messages/{messageId}/reaction-details`

### Uploads & profile
- `POST /api/HubAttachments/upload`
- `POST /api/users/upload-avatar`
- `POST /api/users/upload-cover`

### Users / departments lookup
- `GET /api/users/list-simple`
- `GET /api/crud/userss` (fallback)
- `GET /api/WorkTypes/GetWorkTypes`
- `GET /api/crud/WorkType` (fallback)
- `GET /api/users/profile/{id}`
- `GET /api/users/GetUserDetails/{id}`

## Auth / Error Behavior Expected by Frontend

- Any API `401` should be treated as session expiration.
- Network failure is treated as transient connectivity problem.
- Frontend emits browser events for global handling:
  - `hub:session-expired`
  - `hub:network-error`

