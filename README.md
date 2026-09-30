# Northcut — frontend

Vue 3 + Vite + PrimeVue + Tailwind. Storefront, account pages and the `/admin` panel in one app.

```sh
cp .env.example .env    # VITE_API_URL — where the API runs
npm install
npm run dev             # http://localhost:5173
npm run build           # production build
```

Setup, how to try every flow, and a tour of how the code fits together: [`../README.md`](../README.md).
Coding conventions: [`CLAUDE.md`](CLAUDE.md).

## Deployment (Vercel frontend, Render API)

The frontend is hosted on Vercel and the API on Render — two different domains. The browser never
talks to Render directly: **Vercel proxies `/api/*` to the API**. This is what `vercel.json` does:

```json
{ "source": "/api/:path*", "destination": "https://northcut-backend.onrender.com/api/:path*" }
```

```
Browser ──► https://<app>.vercel.app/api/v1/...   (same domain as the page)
                    │  Vercel forwards it, server to server
                    ▼
            https://northcut-backend.onrender.com/api/v1/...
```

### Why a proxy instead of calling Render directly

1. **Login survives a page reload.** The refresh token is an `httpOnly` cookie with
   `SameSite=strict` ("only send me back to the site that set me"). If the page on `vercel.app`
   called `onrender.com` directly, that's a different site: the browser would never send the cookie
   back, the session couldn't be restored, and every reload would log the user out. Loosening it to
   `SameSite=None` isn't a fix — Safari and Chrome's tracking protections increasingly block such
   third-party cookies anyway. Through the proxy the cookie belongs to the Vercel domain and is
   always sent.
2. **No CORS.** The page and the API share one origin, so the browser does no cross-origin checks.
   (The API still has CORS set up for local development, where the two run on different ports.)

### What must be set

| Where | Setting | Value |
|---|---|---|
| Vercel → Environment Variables | `VITE_API_URL` | `/api/v1` — relative, **no domain** |
| `vercel.json` | `/api/:path*` destination | the **API** service's Render URL (not the worker's) |
| Render (API) | `CLIENT_URL` | this site's Vercel URL (used for email links and the payment return page) |

`VITE_API_URL` is baked in at build time — after changing it, **redeploy**.

The second rewrite in `vercel.json` (`/(.*)` → `/index.html`) is separate: Vue Router uses real
URLs like `/products/abc`, so without it refreshing any page other than `/` would 404 on Vercel.
Real files (the built JS/CSS) are always served before rewrites apply.

### How to check it's working

In DevTools on the live site:
- **Network** — API calls go to `https://<app>.vercel.app/api/v1/...`, not `onrender.com`.
  If they go to `onrender.com`, `VITE_API_URL` wasn't set when the site was built — fix it and redeploy.
- **Application → Cookies** — after logging in, the refresh cookie is listed under the Vercel domain
  with path `/api/v1/auth`.
- **Reload** — you're still logged in.

### If you ever move the API

Update the destination in `vercel.json` (and `CLIENT_URL`/`API_URL` on the API). Keep calling the API
through the proxy — pointing `VITE_API_URL` at the API's own domain brings back the logged-out-on-reload
problem above.
