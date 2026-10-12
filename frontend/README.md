# TripStories frontend

This is the React 19 and Vite frontend for TripStories.

## Local development

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

The frontend uses `http://localhost:8080` for the backend during local Vite
development unless `VITE_API_URL` is set in a local environment file. Never put
database credentials, JWT secrets, or Cloudinary API secrets in a `VITE_*`
variable; Vite values are included in browser code.

To create a production build:

```powershell
npm run build
```

Vite writes the static site to `dist`.

## Vercel project settings

- Root directory: `frontend`
- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Do not set the production `VITE_API_URL` until the Render backend has been
  deployed and its actual HTTPS origin is available.

After Render provides its URL, set `VITE_API_URL` in Vercel's Production
environment to that actual backend origin and redeploy the frontend. Do not use
`localhost` or include an API path. `VITE_API_URL` is public browser
configuration; never put database credentials, JWT secrets, or Cloudinary
secrets in any `VITE_*` variable. `vercel.json` contains the SPA rewrite needed
by React Router.

## Backend requirements

The frontend story and social API calls require the Spring Boot backend. New
stories submitted while signed in are sent to the backend; their photos are
uploaded server-side to Cloudinary. Configure the backend's database, JWT,
CORS, and Cloudinary environment variables on the backend host. Only the public
backend URL belongs in `VITE_API_URL`.

After the Vercel site is deployed, set the Render environment variable
`CORS_ALLOWED_ORIGIN` to the exact Vercel origin, including `https://` and
without a trailing slash (for example, `https://your-project.vercel.app`).
Keep `http://localhost:5173` for local development.

Existing browser `localStorage` data and the local JSON export are not migrated
or deleted by the online story flow. The export remains a local-browser
download; it does not include server data.
