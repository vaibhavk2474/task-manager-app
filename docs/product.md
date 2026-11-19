# Product brief

## Purpose

Task Manager is a personal workspace for turning work into clear, trackable tasks. The first release focuses on dependable task CRUD, ownership, and a calm, polished interface.

## Current user journey

1. Register an account or sign in.
2. Start at Overview to see today's focus, upcoming tasks, overdue work, and completion progress.
3. Open All tasks or a due-date filter to manage the full task list.
4. Create or edit a task with a title, description, status, priority, and optional due date and time.
5. Mark a task complete, search the list, or delete a task.
6. Sign out when finished.

## Scope and data rules

- MongoDB Atlas stores accounts, sessions, and tasks. There is no local MongoDB requirement.
- The API always scopes task operations to the authenticated account.
- An all-day due date remains due through the selected calendar day in the user's time zone; it becomes overdue the next day. A timed deadline becomes overdue when its exact instant passes. Tasks without a deadline and completed tasks are never overdue.
- Overdue counts and filters include open tasks only and use the time zone supplied by the signed-in user's browser.
- The browser does not persist task records or authentication tokens in local storage.
- Password recovery, email, collaboration, attachments, recurring tasks, and notifications are outside the first release.
- If Atlas is not configured or reachable, the API reports a clear startup error rather than silently falling back to browser storage.

## Product principles

- Make adding and updating a task quick.
- Show task status and priority clearly.
- Keep the interface accessible, responsive, and visually consistent through shared theme tokens.
- Protect account-owned data at the API boundary.
