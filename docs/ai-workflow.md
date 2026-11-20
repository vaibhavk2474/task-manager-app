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

## Task deadline guidance

- Read the deadline semantics in `AGENTS.md` and `docs/architecture.md` before changing deadline behavior.
- Preserve the distinction between a date-only all-day deadline and an exact timed instant. Keep `dueDate` and `dueAt` paired on API updates, and send the browser's IANA time zone when querying local-day filters.
- Reject a new deadline or changed deadline in the past in both the form and API. Let a task with an existing past deadline remain editable when its deadline is unchanged, and do not persist request-only time-zone metadata on the task.
- When changing overdue behavior, account for time-zone day boundaries, completed tasks, tasks with no deadline, and deadlines that pass while the task list remains open.

## Overview dashboard guidance

- Keep overview cards and previews derived from the authenticated task API response. Do not add a second browser-side task store or duplicate dashboard-specific task endpoints without a product need.
- Reuse the shared deadline helpers when grouping Today, Upcoming, or Overdue tasks. Summary card actions should take the user to the corresponding existing task filter.
- Keep Overview useful on narrow screens: collapse metric and preview grids, keep the main page as the only scroll area, and use the shared MUI theme values.
- Keep sidebar destinations limited to Overview and All tasks. Place task filters beside the All tasks heading, allow the controls to wrap on small screens, and ensure Overview card links select the corresponding filter without making a filter appear as a separate sidebar destination.
- Preserve equivalent edit, delete, and completion actions in card and table views. Pagination is server-side: keep Mongo filtering/search before skip/limit, return the matching total and effective page, and preserve the Overview preview query. Reset to page one when filters, search, layout, or mutations change the results; keep narrow-screen table overflow inside its container.
- Treat loading, empty, and failed requests as distinct UI states. Give loading indicators accessible names or live announcements, expose retry actions after fetch failures, and do not present an initial load failure as an empty result. Prefer native semantic controls over clickable generic elements and provide visible keyboard focus.
