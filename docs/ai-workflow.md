# AI-assisted development workflow

Keep durable project knowledge in the repository so future work does not depend on chat history.

## Feature request

```text
Read AGENTS.md and the relevant section of docs/architecture.md. Inspect the owning feature and its callers only.

User outcome:
[What should a person be able to do?]

Acceptance criteria:
- [Observable result]
- [Important edge case]

Summarize the current behavior and propose the smallest safe change. Implement it, update relevant docs, and report files changed and checks run.
```

## Bug report

```text
Read AGENTS.md. Trace the reported behavior to its owning frontend feature/backend module before editing.

Steps:
1. [Action]
2. [Action]

Expected: [Expected behavior]
Actual: [Observed behavior]

Identify the cause, make a focused fix, and describe how it was checked.
```

## UI request

```text
Read AGENTS.md, docs/product.md, and the relevant architecture section. Keep data behavior intact unless the request changes it. Use the central MUI theme and semantic palette values. Preserve keyboard and accessibility behavior.
```

## Context and handoff

- Include outcome, acceptance criteria, relevant paths, and observed errors; omit unrelated source.
- Never paste Atlas credentials, session secrets, or real task data into prompts or docs.
- When pausing, record goal, current state, decisions, next files, and checks in the issue/chat. Put durable product/architecture decisions in docs, not chat transcripts.

## Security review guidance

- Read the **Current security baseline and known limits** section of `docs/architecture.md` before changing authentication, sessions, middleware, or API routes. Distinguish protections already implemented from the hardening backlog; do not imply that planned controls already exist.
- Keep task reads and writes owner-scoped, validate untrusted input at the route boundary, and preserve same-origin checks on state-changing requests. Do not move sessions or task data into browser storage or expose credentials in source, logs, or documentation.
- Production API traffic is routed through the Vercel same-origin rewrite. Do not add wildcard CORS or relax `APP_ORIGIN` checks without an explicit architecture change.
- The existing auth limiter only covers sign-up/sign-in and uses a per-process memory store. Do not present it as a global or distributed API limit. Any future recovery endpoint needs its own abuse controls and must not reveal whether an email is registered.
- For future password work, confirm hashing compatibility with the accepted length, favor passphrases and common/compromised-password rejection over character-class rules, and enforce the same policy in both frontend guidance and backend validation.

## Deferred task model guidance

- Subtasks and Goals are **planned, not implemented**. Do not add their schema, routes, UI, or navigation without a product request to start implementation.
- The current proposal embeds ordered subtasks in the parent task, inheriting the parent's owner and optional goal association. Keep each parent as one main-list item; show checklist progress in cards/table and edit individual items in the task dialog. First version has no independent subtask owner, deadline, priority, or status.
- Goals are proposed as a separate owner-scoped entity, with an optional association from a task to one goal. Leave tasks unassigned when appropriate. Label derived progress as completed linked tasks / total linked tasks, not as a direct measure of goal achievement.
- Stronger password policy and forgot-password email are low-priority future features. Password recovery is not present today; an implementation needs a provider decision, single-use expiring reset tokens stored only as hashes, generic responses, request throttling, and session invalidation after reset.

## Task deadline guidance

- Read the deadline semantics in `AGENTS.md` and `docs/architecture.md` before changing deadline behavior.
- Preserve the distinction between a date-only all-day deadline and an exact timed instant. Keep `dueDate` and `dueAt` paired on API updates, and send the browser's IANA time zone when querying local-day filters.
- Reject a new deadline or changed deadline in the past in both the form and API. Let a task with an existing past deadline remain editable when its deadline is unchanged, and do not persist request-only time-zone metadata on the task.
- When changing overdue behavior, account for time-zone day boundaries, completed tasks, tasks with no deadline, and deadlines that pass while the task list remains open.

## Overview dashboard guidance

- Keep overview cards and previews derived from the authenticated task API response. Do not add a second browser-side task store or duplicate dashboard-specific task endpoints without a product need.
- Reuse the shared deadline helpers when grouping Today, Upcoming, or Overdue tasks. Summary card actions should take the user to the corresponding existing task filter.
- Keep Overview useful on narrow screens: collapse metric and preview grids, keep the main page as the only scroll area, and use the shared MUI theme values.
- Keep sidebar destinations limited to Overview and All tasks. On All tasks, keep the heading and card/table toggle on the top row, then place wrapping filters and sorting below; let the controls stack on narrow screens. Ensure Overview card links select the corresponding filter without making a filter appear as a separate sidebar destination.
- Preserve equivalent edit, delete, and completion actions in card and table views. Pagination is server-side: keep Mongo filtering/search before skip/limit, return the matching total and effective page, and preserve the Overview preview query. Reset to page one when filters, search, sorting, layout, or mutations change the results; keep narrow-screen table overflow inside its container.
- Sorting is server-side and validated by the list query schema. Apply filters and sort before skip/limit, use a deterministic tie-break order, keep undated tasks last for due-date sorts, and reset pagination when the selected sort changes. Overview previews continue to use due-soon order.
- Treat loading, empty, and failed requests as distinct UI states. Give loading indicators accessible names or live announcements, expose retry actions after fetch failures, and do not present an initial load failure as an empty result. Prefer native semantic controls over clickable generic elements and provide visible keyboard focus.
