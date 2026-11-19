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
- When changing overdue behavior, account for time-zone day boundaries, completed tasks, tasks with no deadline, and deadlines that pass while the task list remains open.
