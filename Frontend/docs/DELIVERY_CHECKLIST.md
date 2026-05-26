# Delivery Checklist

Use this checklist before handing the project to a company/team.

## 1) Verify Steps

- [ ] `npm install` completes without errors
- [ ] `.env` values are set from `.env.example`
- [ ] `npm run dev` starts and app is reachable
- [ ] Login works with valid test account
- [ ] Core chat flow works (open chat, send, receive, typing)
- [ ] Admin dashboard opens for authorized roles only

## 2) Build / Test Checklist

- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] No new TypeScript errors
- [ ] No critical runtime console errors during smoke flow

## 3) Environment Checklist

- [ ] `VITE_HUB_API_BASE_URL` is correct for target backend
- [ ] `VITE_HUB_SIGNALR_URL` is correct for realtime hub
- [ ] `VITE_HUB_ENABLE_ADMIN_DASHBOARD` matches deployment need
- [ ] Auth tokens are issued by backend with expected role claims

## 4) Deployment Readiness Checklist

- [ ] Backend CORS allows frontend host
- [ ] API and SignalR URLs are reachable in deployment environment
- [ ] Reverse proxy routing for `/api/*` and hub path is configured
- [ ] Error monitoring/logging plan is defined
- [ ] Default demo credentials removed/rotated for production

## 5) Smoke Test Checklist (Post-Deploy)

- [ ] Login success/failure behavior is correct
- [ ] Conversation list loads
- [ ] Message send/receive works in realtime
- [ ] Typing indicator appears only in active conversation
- [ ] Session expiration redirects/forces re-login correctly
- [ ] Admin actions (department/role/status) return expected feedback

