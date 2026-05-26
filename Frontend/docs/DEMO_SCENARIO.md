# Demo Scenario (5–10 Minutes)

This script helps any engineer/presenter run a consistent product demo.

## 1) Demo Start (30–60s)

1. Open application and show login page.
2. Explain this is an internal communication product for companies:
   - private messages
   - department channels
   - admin operations
   - realtime status/typing/reactions

## 2) Suggested Demo Accounts

If your backend seed provides them, use:
- `admin / 123456`
- `manager / 123456`
- `employee / 123456`

If account names differ, use any accounts representing these roles.

## 3) Core Product Flow (3–4 min)

1. Login as employee/admin.
2. Open hub widget.
3. Open a conversation.
4. Send text message and show immediate UI update.
5. Send attachment/media and show upload/loading status.
6. Show message reaction and delivered/read updates.
7. Show typing indicator with a second client/session.

## 4) Realtime & Reliability Flow (1–2 min)

1. Demonstrate reconnect behavior:
   - temporarily disconnect network (or stop backend briefly)
   - show reconnect/status banners
   - restore connectivity and show recovery
2. Mention guarded session handling:
   - unauthorized/expired token triggers session-expired flow

## 5) Admin Flow (2–3 min)

1. Open Admin Dashboard.
2. Show metrics cards:
   - total users
   - online users
   - active admins/managers
3. Search users + pagination.
4. Change department for a user.
5. (If backend supports) change role / enable-disable user.
6. Explain role-based access differences (admin vs manager vs employee).

## 6) Closing Points (30s)

- Integration-ready module with adapter-based host integration
- Documented API/realtime contracts
- Session/network/reconnect hardening
- Ready for internal pilot / beta deployment

