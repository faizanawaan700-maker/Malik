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

Open `http://localhost:3000`. In production, set `NODE_ENV=production` and serve the site over HTTPS so the session cookie is marked `Secure`. If the app is behind a reverse proxy, set `TRUST_PROXY_HOPS` to the exact number of trusted proxies; leave it unset otherwise.

## Access protection

The password is checked only by the Express server. Birthday HTML and media require an authenticated session. The session cookie is HttpOnly, SameSite=Strict, and Secure in production. Failed password attempts are rate-limited. The password and session secret must be supplied through `.env`; no real secrets belong in source control.
