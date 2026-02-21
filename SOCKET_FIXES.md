# Socket.IO Fix Notes

## What I changed

1. **Fixed socket auth token verification on backend**
   - Updated socket auth middleware to verify with `JWT_ACCESS_SECRET` (the same secret used to sign access tokens).
   - Added support for both token locations:
     - `socket.handshake.auth.token`
     - `accessToken` from handshake cookies
   - Added payload compatibility for both `_id` and `id` fields.

2. **Improved frontend socket connection setup**
   - Updated socket provider to:
     - Use `NEXT_PUBLIC_BACKEND_URL` instead of hardcoded URL.
     - Send credentials (`withCredentials: true`).
     - Allow both `websocket` and `polling` transports for better browser compatibility.
     - Add `connect_error` logging for easier debugging.
   - Uses `accessToken` from `localStorage` when present.

3. **Made login response usable for socket auth in browser clients**
   - Updated backend login/register responses to include `accessToken` in JSON response body.
   - Updated frontend login component to persist `accessToken` to `localStorage` after successful login.

## Why this fixes "socket works inconsistently across browsers"

- Different browsers can behave differently with cross-origin cookies and websocket handshakes.
- By supporting token via `auth.token` and cookie fallback, the backend accepts either mode.
- By storing `accessToken` in local storage and passing it explicitly in socket auth, clients no longer depend only on cookie forwarding behavior.
- Fallback transport (`polling`) helps in environments where websocket upgrade is blocked.

## Build / run notes

- Backend:
  - Ensure `JWT_ACCESS_SECRET` is set in backend environment.
  - Run backend on port `8000` (or update frontend env).
- Frontend:
  - Set `NEXT_PUBLIC_BACKEND_URL=http://localhost:8000` in frontend env.
  - Login once so `accessToken` is saved.
