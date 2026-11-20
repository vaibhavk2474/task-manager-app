# Roadmap

This is a planning guide, not a commitment. Keep each milestone small and based on a user need.

## 1. First release

- Account registration, sign-in, session restore, and sign-out.
- Owner-scoped MongoDB task CRUD.
- Overview and All tasks navigation, with All/today/upcoming/overdue/completed filters, search, priority, optional date/time deadlines, server-side sorting, and paginated card/table views.
- Responsive Overview dashboard with today's focus, upcoming tasks, overdue visibility, and completion progress.
- Centralized light/dark theme.
- Accessibility and UI state baseline: keyboard-operable task actions, labeled navigation and search, accessible loading announcements, retryable fetch errors, and distinct empty states.

## 2. Everyday planning

- Bulk task actions.
- Bulk completion and keyboard shortcuts.

## 3. Low-priority future work

### Task planning

- **Subtasks:** Add an ordered checklist embedded in its parent task. Keep the parent as the sole task-list item, show completed/total progress in cards and table, and manage checklist entries in the task dialog. Subtasks inherit the parent task's owner and any goal association; do not give them their own deadlines, priorities, or statuses in the first version.
- **Goals:** Add a separate owner-scoped Goals section and let each task optionally link to one goal. Show progress as completed linked tasks out of total linked tasks, clearly described as task progress rather than measured goal achievement.
- Recurring tasks, labels, projects, reminders, exports, and collaboration need a specific user story and data/privacy decisions before being scheduled.

### Account security and recovery

- **Stronger password policy:** Revisit the current 8-character minimum. Proposed password-only baseline follows NIST guidance: at least 15 characters, allow at least 64, reject common or compromised choices, and avoid arbitrary character-class rules. Confirm hashing compatibility, then enforce the final policy in both the API and sign-up UI; see `docs/architecture.md` for the standard reference.
- **Forgot password:** Add a secure recovery flow using short-lived, single-use reset tokens stored as hashes, generic responses that do not reveal whether an account exists, request throttling, and session invalidation after reset. Select an email provider when this work is scheduled; none is currently chosen.
- **Security hardening:** Consider a shared rate-limit store for multi-instance deployments, endpoint-appropriate rate limits for task APIs, an absolute session lifetime in addition to the current rolling expiry, and less account-specific registration errors.
