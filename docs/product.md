# Product brief

## Purpose

Task Manager is a personal workspace for turning work into clear, trackable tasks. The first release focuses on dependable task CRUD, ownership, and a calm, polished interface.

## Current user journey

1. Register an account or sign in.
2. Review the task overview and filter by all, today, upcoming, or completed.
3. Create or edit a task with a title, description, status, priority, and optional due date.
4. Mark a task complete, search the list, or delete a task.
5. Sign out when finished.

## Scope and data rules

- MongoDB Atlas stores accounts, sessions, and tasks. There is no local MongoDB requirement.
- The API always scopes task operations to the authenticated account.
- The browser does not persist task records or authentication tokens in local storage.
- Password recovery, email, collaboration, attachments, recurring tasks, and notifications are outside the first release.
- If Atlas is not configured or reachable, the API reports a clear startup error rather than silently falling back to browser storage.

## Product principles

- Make adding and updating a task quick.
- Show task status and priority clearly.
- Keep the interface accessible, responsive, and visually consistent through shared theme tokens.
- Protect account-owned data at the API boundary.
