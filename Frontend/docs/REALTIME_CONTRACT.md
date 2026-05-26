# Realtime Contract (SignalR + Frontend Events)

This document defines the realtime lifecycle and event expectations currently used by the frontend.

## SignalR Connection Lifecycle

Frontend internal adapter: `core/realtime/useSignalRInternal.ts`

Connection phases exposed:
- `idle`
- `connecting`
- `connected`
- `reconnecting`
- `disconnected`

Behavior:
- Automatic reconnect schedule: `[0, 2000, 5000, 10000, 30000]` ms
- Additional guard retries with capped backoff (to prevent reconnect storms)
- Start attempts are throttled and deduplicated
- Cleanup on stop/unmount clears retry timers and stale connection references

## Incoming Hub Events (from backend)

Registered listeners:
- `ReceiveMessage`
- `ReceiveNotification`
- `UserOnline(userId)`
- `UserOffline(userId)`
- `InitialOnlineUsers(userIds)`
- `UserTyping(userId, chatId, isTyping)`
- `MessageDelivered(data)`
- `MessagesDelivered(data)`
- `MessageRead(data)`
- `MessagesRead(data)`
- `ReactionUpdated(data)`

Frontend reaction:
- Updates message lists/status maps
- Updates typing indicators with auto-expire timeout
- Triggers counts/conversation/items reload (batched in hook)

## Outgoing Hub Invocations (frontend -> backend)

- `JoinChatRoom(chatId)`
- `LeaveChatRoom(chatId)` (optional use)
- `JoinGlobalChannel()`
- `JoinDepartmentChannel(deptId)`
- `JoinDepartmentChat(deptId)`
- `NotifyTyping(chatId, isTyping)`

## Browser-level Integration Events

These are emitted by API/network layers for global UX/session handling:

### `hub:session-expired`
- **Who emits**: API client / upload service on HTTP `401`
- **When**: token expired / unauthorized response
- **Frontend expectation**: clear session, force re-authentication flow

### `hub:network-error`
- **Who emits**: API client / upload service on network failure
- **When**: request cannot reach backend
- **Frontend expectation**: show non-blocking network warning / toast

Both events are throttled in core API path to avoid storming UI on bulk failures.

