# Task Manager

A focused, full-stack task manager built with React, TypeScript, Vite, Material UI, Express, and MongoDB Atlas. Create an account, organize work, and track tasks through completion.

## Product capabilities

- Create, view, update, complete, search, filter, and delete tasks.
- Set a task title, description, status, priority, and optional due date.
- Sign up, sign in, restore a session, and sign out.
- Store accounts, sessions, and tasks in MongoDB Atlas. Tasks are scoped to their owner on every API operation.
- Change light/dark appearance. Shared colors, typography, spacing, and component defaults live in the central MUI theme.

Password recovery, email delivery, local MongoDB, and browser task storage are not part of this application.

## Requirements

- Node.js 22 or newer and npm.
- A MongoDB Atlas cluster and a connection string. Add your current IP address to the Atlas Network Access list and create a database user with access to the application database.
- Docker Desktop with Compose only if you want to use the container workflow.

## Configure MongoDB Atlas

Copy the backend environment template and set the values for your Atlas cluster:

```powershell
Copy-Item backend/.env.example backend/.env
```

Set `MONGODB_URI` to your private Atlas connection string, using `task_manager_app` as the database name. Replace `SESSION_SECRET` with a random secret of at least 32 characters. Keep `backend/.env` private; it is ignored by Git.

Generate a session secret in PowerShell with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(48).toString('hex'))"
```

Atlas passwords containing URL-special characters must be percent-encoded in the URI.

## Run without Docker

Open two terminals from the project folder. The backend connects directly to Atlas; the frontend proxies `/api` requests to it.

Terminal 1:

```powershell
cd backend
npm install
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm install
npm run dev
```

Open [http://localhost:5175](http://localhost:5175). The API runs at `http://localhost:3002`. Both servers must be running, and Atlas must be reachable.

## Run with Docker

Create `backend/.env` as described above, then run from the project folder:

```powershell
docker compose up --build
```

Open [http://localhost:5175](http://localhost:5175). Compose runs only the frontend and API; the API connects to the same Atlas database. It does not create a MongoDB or email container. Source code is mounted for live development, while `node_modules` stays in the image so stale dependency volumes cannot hide newly installed packages. Run `docker compose down` to stop the containers.

## Deploy frontend with Vercel

Set the Vercel project root directory to `frontend`. The checked-in `frontend/vercel.json` forwards API requests to the Render backend while keeping the browser on the Vercel origin.

Add `RENDER_API_URL` to the Vercel project's Environment Variables. Set its value to the Render service's public origin, such as `https://your-api.onrender.com`, with no trailing slash or `/api` suffix. Apply it to Production (and Preview if those deployments should use an API). Redeploy after changing the variable.

On Render, set `APP_ORIGIN` to the exact production Vercel origin, such as `https://your-app.vercel.app`. Keep the backend's Atlas URI and session secret in Render's environment settings, not in the frontend or repository.

## Project structure

```text
backend/src/
  config/                 Environment validation
  db/                     Mongo connection
  modules/auth/           Registration, login, session, logout
  modules/tasks/          Task routes, validation, rules, repository, model
frontend/src/
  app/                    Route composition and providers
  features/auth/          Auth screens, session state, route guard
  features/tasks/         Task API, state, views, and task form
  shared/                 API client and reusable application shell
  theme/                  Central design tokens and MUI theme
docs/                     Product, architecture, roadmap, AI workflow
```

For future work, read `AGENTS.md`, then the relevant section of `docs/architecture.md`. See `docs/ai-workflow.md` for feature, bug, and UI change templates.
