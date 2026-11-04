# Zahra's Private Birthday Experience

## Setup

1. Install Node.js 18 or newer.
2. Copy `.env.example` to `.env`.
3. Set `ACCESS_PASSWORD` to a private password of your choice. Do not send it in chat or commit `.env`.
4. Generate a session secret and set `SESSION_SECRET`:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Optionally add Zahra's photo at `public/media/zahra.jpg`.
6. Install dependencies and start the site:

   ```powershell
   npm install
   npm start
   ```

Open `http://localhost:3000`. In production, serve the site over HTTPS so the session cookie is marked `Secure`. Vercel's `VERCEL=1` environment automatically enables its proxy trust and secure cookies. For other reverse proxies, set `TRUST_PROXY_HOPS` to the exact number of trusted proxies; leave it unset otherwise.

The session is a signed, stateless cookie containing only the authorization flag. It works across serverless instances and does not require Redis, a database, or another session-storage provider. The cookie is signed, not encrypted; do not add secrets to the session. On Vercel, add `ACCESS_PASSWORD`, `SESSION_SECRET` (at least 32 random characters), and optionally `WHATSAPP_NUMBER` in the project's Environment Variables settings. Rotating `SESSION_SECRET` invalidates existing sessions.

## Access protection

The password is checked only by the Express server. Birthday HTML and media require an authenticated session. The session cookie is HttpOnly, SameSite=Strict, and Secure in production. Failed password attempts are rate-limited. The password and session secret must be supplied through `.env`; no real secrets belong in source control.
