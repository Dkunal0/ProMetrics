# ProMetrics - Run & Deploy Guide

## Run locally
1. Install Node.js LTS and MongoDB Community Server.
2. Open a terminal in `backend`.
3. Run `npm install`.
4. (Optional) Set `MONGODB_URI` and `JWT_SECRET` as environment variables in your terminal. The backend has local MongoDB defaults for testing.
5. Run `npm start`. Backend runs on port 5000.
6. Open `frontend/login.html` with VS Code Live Server.

## Deploy for public access (Netlify + Render + MongoDB Atlas)

### 1. MongoDB Atlas
- Create a free MongoDB Atlas cluster and a database user.
- Configure Network Access to allow the Render service to connect. For a quick demo, Atlas allows adding `0.0.0.0/0`; this is broad access, so use strong database credentials and prefer restricting IP access when feasible.
- Copy the Atlas connection string and replace the username/password placeholders.

### 2. Render backend
- Push this project to GitHub.
- In Render, create a Web Service from the repository.
- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`
- Add environment variables: `MONGODB_URI` (Atlas connection string), `JWT_SECRET` (long random secret), `FRONTEND_URL` (your Netlify site URL; after first deploy, set it and redeploy).
- Render sets `PORT` automatically.

### 3. Netlify frontend
- Import the repository into Netlify.
- Base directory: `frontend`
- Build command: leave blank
- Publish directory: `.`
- Deploy.
- In `frontend/api-config.js`, change `window.API_BASE` to your Render backend URL (https://...onrender.com), then commit/push so Netlify redeploys.
- After Netlify gives you the site URL, set Render `FRONTEND_URL` to that exact URL (no trailing slash) and redeploy backend.

### 4. Verify on mobile
- Open your Netlify URL on phone. Test registration, login, adding a productivity log, and dashboard refresh.

## Security note
Before using with real users, strengthen validation, error handling, rate limiting, and user/account controls. Do not commit `.env` or real secrets. The current auth flow uses a fallback JWT secret for local compatibility; for deployment, always set `JWT_SECRET` to a strong unique secret.
