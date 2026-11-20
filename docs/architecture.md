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
- `frontend/src/features/tasks/`: task model, API functions, task state/query hooks, task form, filters, and dashboard views. `components/OverviewDashboard.tsx` derives its previews from the same owner-scoped task response and count summary used by the task list; keep date grouping aligned with `utils/deadline.ts` and the API's time-zone-aware filters.
- `frontend/src/shared/api/`: shared fetch client, cookie credentials, and consistent API error parsing.
- `frontend/src/shared/layouts/`: authenticated shell with header, sidebar, responsive navigation, and content region.
- The shell fills the viewport: the desktop sidebar and header stay fixed, and only the main content panel scrolls vertically. Keep horizontal overflow contained in the content panel. The mobile shell uses a temporary drawer. Preserve these scroll and sizing rules in `TaskShell` when changing navigation or shell layout.
- The authenticated sidebar has only Overview and All tasks destinations. Today, Upcoming, Overdue, and Completed are task-list filters in `features/tasks/components/TaskFilters.tsx`; dashboard links select the matching filter and keep All tasks active in navigation. In All tasks, keep the title and card/table toggle on the top row, then place wrapping filters and the sort selector on a separate responsive row below.
- All tasks supports card and table presentation through `components/TaskList.tsx` and `components/TaskTable.tsx`. The list API validates `sort` and `page`/`pageSize` (1–100), applies owner-scoped filtering/search and sorting in MongoDB before `skip`/`limit`, and returns matching `totalItems`, `totalPages`, and the effective page. Sorting options are due soonest/latest (undated tasks last), priority high/low, recently/oldest updated, and title A–Z/Z–A. Due soonest is the default; secondary sort fields and task ID make results deterministic. The UI requests 8 cards or 10 table rows and resets to page one when sorting, filter, search, layout, or a task mutation changes. `includePreviews=true` returns four each of the upcoming, today, and overdue tasks for Overview in due-soon order without requiring the dashboard to download the whole task list. Keep table overflow contained in its table container on narrow screens.
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

## Current security baseline and known limits

- Task routes require a signed-in session, and every task repository operation scopes access by the authenticated user's ID. Do not rely on a task ID alone for authorization.
- Sign-up and sign-in use strict Zod schemas. Task create/update bodies, list query parameters, and task IDs are validated at the route boundary. JSON request bodies are capped at 32 KB. Helmet supplies security headers.
- Passwords are hashed with bcryptjs at cost 12. The current sign-up schema requires at least 8 characters and allows up to 72; stronger password rules are future work. Sign-in uses a generic invalid-credentials message, while duplicate sign-up email currently returns a distinct conflict response.
- Express sessions are stored in MongoDB collection `task_manager_sessions`. The session ID is regenerated on sign-up and sign-in. `SESSION_SECRET` must be at least 32 characters. The cookie is `HttpOnly`, `SameSite=Lax`, and `Secure` when `NODE_ENV=production`; it has a seven-day rolling expiry. There is no separate absolute session lifetime yet. Render must use `NODE_ENV=production` for the secure cookie setting; the app trusts one proxy hop in production.
- `requireSameOrigin` compares the browser `Origin` header exactly with configured `APP_ORIGIN` for state-changing auth and task requests. The cookie's `SameSite=Lax` is an additional CSRF defense. There is no synchronizer CSRF token. In production, `APP_ORIGIN` must exactly match the browser-facing Vercel origin. Production frontend API calls use the same-origin Vercel rewrite; no permissive CORS middleware is configured. Preserve the origin check and do not add state-changing behavior to GET routes.
- Sign-up and sign-in share an `express-rate-limit` limit of 20 requests per 15 minutes. It uses the default in-memory store, so limits are per running process and reset with process restarts. Task-list and task-mutation endpoints have no rate limiter currently.
- Treat these controls as the application's current baseline, not a complete security audit. Low-priority hardening ideas are a shared/distributed rate-limit store, endpoint-appropriate limits for task APIs, an absolute session lifetime, and reducing account-enumeration detail at registration. Keep those items distinct from implemented controls.

## Data model

`User` stores normalized email, display name, password hash, and timestamps. `Task` stores `ownerId`, title, description, status (`todo`, `in_progress`, `done`), priority (`low`, `medium`, `high`), optional `dueDate`, optional `dueAt`, and timestamps. `dueDate` is the selected calendar day stored as a UTC-noon marker so it remains date-only; `dueAt` is either null (all-day deadline) or the exact UTC instant for the selected local date and time. Existing records with `dueDate` and no `dueAt` remain valid all-day tasks. API updates must submit both deadline fields together. Index tasks by owner and due date/dueAt/updated date for scoped lists.

The frontend sends its IANA time zone on task-list and task-mutation requests. The task service uses it for local day boundaries: date-only tasks become overdue after their selected day ends, while timed tasks become overdue immediately after their stored instant. New deadlines must not be in the past, validated both in the form and service. An update may retain an existing past deadline unchanged so overdue tasks remain editable; changing a deadline to the past is rejected. Completed tasks are excluded from open, today, upcoming, and overdue counts.

## Docker and environment

Compose has the unique project identity `task-manager-app`, dedicated frontend/API container and image names, and a private `task-manager-app-network`. It does not run MongoDB or email services. `backend/.env` supplies the Atlas URI and session secret to both local and container runs. Host ports are frontend `5175` and API `3002`, chosen to avoid common ports used by neighboring development apps.

For Compose, mount source/config files individually instead of mounting the entire frontend directory over `/app`. This leaves the image-installed `node_modules` visible and avoids a persistent dependency volume hiding packages after a rebuild.

## Change guidance

- Add task behavior in the task feature/backend module rather than in the shell.
- Keep deadline semantics consistent across `task.schemas.ts`, `task.service.ts`, the task form, and `features/tasks/utils/deadline.ts`. Never infer an all-day deadline's due time from a UTC offset.
- Mutation requests carry a validated IANA `timeZone` for local-day deadline validation. Do not store that request metadata on task documents. Preserve existing past deadline values when editing other task fields.
- Update the product and architecture documents when user behavior or data flow changes.
- Add a decision record only for choices that affect multiple modules or are costly to reverse.

## Deferred feature design notes (not implemented)

- **Subtasks:** Keep the parent Task as one task-list item and embed an ordered array of checklist entries in its MongoDB document. Each entry needs a stable subtask ID, title, and completion state; its access inherits from the parent task's `ownerId`. Do not create a separate subtask owner or independent deadline/priority/status in the first version. Show a compact completed/total summary in task lists and the full checklist in the task dialog. Check the parent task's ownership before any nested update. If a parent task is linked to a goal, subtasks inherit that association through the parent.
- **Goals:** Model goals as a separate owner-scoped entity, with an optional `goalId` association on a task; unassigned tasks remain valid. Initially associate a task with at most one goal. Show goal progress as completed linked tasks out of total linked tasks, clearly labeled as task progress rather than measured goal achievement. A future product request must confirm fields, navigation, and completion semantics before implementation.
- **Strong password policy:** This is low priority and not implemented. Before changing the current 8-character minimum, confirm the target policy and hash compatibility. Proposed baseline for password-only sign-in, following [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html): require at least 15 characters, allow at least 64, reject common/compromised passwords, and avoid arbitrary uppercase/digit/symbol composition rules. Communicate requirements in the form and enforce them in the API.
- **Forgot password/email:** This is low priority and not implemented. The provider is undecided. A future flow should use a short-lived, single-use reset token (store only its hash), return a generic response that does not reveal whether an account exists, rate-limit requests, and invalidate existing sessions after a successful reset.
