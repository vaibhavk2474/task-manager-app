# Architecture and source map

## Runtime and data flow

- `frontend/` is a React + TypeScript SPA built with Vite and Material UI.
- `backend/` is an Express + TypeScript API. Mongoose connects to MongoDB Atlas.
- Vite proxies `/api` to the backend during local development. Docker Compose uses the same origin proxy across its private app network. Production Vercel deployments use `frontend/vercel.json` to forward `/api/*` requests to Render; the destination host comes from the Vercel `RENDER_API_URL` environment variable.
- Express sessions are stored in MongoDB through `connect-mongo`; the browser receives an HttpOnly cookie. Authentication tokens and task data are not stored in browser local storage.
- Task requests require a valid session. Every repository read/update/delete filters by both task ID and owner ID.

## Frontend ownership

- `frontend/src/app/`: route configuration and provider composition.
- `frontend/src/features/auth/`: sign-in/sign-up screens, auth API, session context, and route guards.
- `frontend/src/features/tasks/`: task model, API functions, task state/query hooks, task form, filters, and dashboard views.
- `frontend/src/shared/api/`: shared fetch client, cookie credentials, and consistent API error parsing.
- `frontend/src/shared/layouts/`: authenticated shell with header, sidebar, responsive navigation, and content region.
- The shell fills the viewport: the desktop sidebar and header stay fixed, and only the main content panel scrolls vertically. Keep horizontal overflow contained in the content panel. The mobile shell uses a temporary drawer. Preserve these scroll and sizing rules in `TaskShell` when changing navigation or shell layout.
- `frontend/src/theme/tokens.ts`: the single edit point for brand palette, typography, spacing scale, shape, and elevation values.
- `frontend/src/theme/theme.ts`: maps tokens into MUI light/dark themes and shared component defaults. UI code should use semantic theme values (`primary.main`, `background.paper`, `text.secondary`, `divider`) instead of hard-coded colors.
- `frontend/src/index.css`: font loading and minimal document-level reset only; product colors and component styling belong in the MUI theme.

## Backend ownership

- `backend/src/config/`: environment parsing and validation.
- `backend/src/db/`: MongoDB connection.
- `backend/src/modules/auth/`: auth routes, input schemas, controller, service, user model, and session middleware.
- `backend/src/modules/tasks/`: task routes, input schemas, controller, service, repository, and Mongoose model.
- Routes validate input and apply auth/origin controls; controllers translate HTTP; services enforce product rules; repositories own Mongo queries.
- Task queries must include `ownerId`. Never trust an owner ID supplied by the client.

## Data model

`User` stores normalized email, display name, password hash, and timestamps. `Task` stores `ownerId`, title, description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), optional `dueDate`, and timestamps. Index tasks by owner and due date/updated date for scoped lists.

## Docker and environment

Compose has the unique project identity `task-manager-app`, dedicated frontend/API container and image names, and a private `task-manager-app-network`. It does not run MongoDB or email services. `backend/.env` supplies the Atlas URI and session secret to both local and container runs. Host ports are frontend `5175` and API `3002`, chosen to avoid common ports used by neighboring development apps.

For Compose, mount source/config files individually instead of mounting the entire frontend directory over `/app`. This leaves the image-installed `node_modules` visible and avoids a persistent dependency volume hiding packages after a rebuild.

## Change guidance

- Add task behavior in the task feature/backend module rather than in the shell.
- Update the product and architecture documents when user behavior or data flow changes.
- Add a decision record only for choices that affect multiple modules or are costly to reverse.
