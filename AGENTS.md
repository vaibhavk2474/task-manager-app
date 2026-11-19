# Project instructions for coding agents

Read this file and `docs/architecture.md` first. Read `docs/product.md` for user-facing changes. Treat the implementation as the source of truth and update the docs when behavior or architecture changes.

## Work in small, reviewable steps

- Start with the specific feature's source map in `docs/architecture.md`; inspect only its owner modules and callers.
- Preserve behavior outside the requested change. Avoid broad rewrites and speculative abstractions.
- Keep frontend feature code in `frontend/src/features/<feature>` and shared UI/infrastructure in `frontend/src/shared`.
- Keep backend business rules in feature services, database access in repositories, and HTTP concerns in controllers/routes.
- All task data must be read and written through the authenticated API and MongoDB. Never persist task records or session tokens in browser storage.
- Every task query and mutation must include the signed-in user's ID. Add ownership checks when introducing endpoints.
- Validate untrusted API input at the route boundary. Keep secrets in ignored environment files, never in source or docs.
- Keep visual values in `frontend/src/theme/tokens.ts` and the MUI theme. Components should use semantic palette values and theme spacing.
- This project has no password recovery or email feature. Do not add those modules unless a product request explicitly asks for them.

## Before finishing

- Review the final diff for unrelated changes, missing docs, and leaked secrets.
- For frontend changes, run `npm run lint` and `npm run build` from `frontend/` when dependencies are installed.
- For backend changes, run `npm run lint` and `npm run build` from `backend/` when dependencies are installed.
- Report behavior changes, files/areas changed, checks run, and limitations.

## Current product facts

- The frontend is React, TypeScript, Vite, and MUI. The backend is Express, TypeScript, and Mongoose.
- MongoDB Atlas is the only data store. The backend connects through `backend/.env`; Compose does not run MongoDB.
- Authentication supports registration, sign-in, session restore, and sign-out. Password recovery and email are intentionally absent.
- Tasks are account-owned MongoDB records. The browser does not cache task data in `localStorage`.
- See `docs/product.md`, `docs/architecture.md`, and `docs/roadmap.md` for the current scope and next steps.
