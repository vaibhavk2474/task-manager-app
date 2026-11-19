# 0001: Store date-only deadlines separately from timed deadline instants

- Status: Accepted
- Date: 2026-11-20

## Context

A task may be due on a calendar day without a specific time, or at an exact local date and time. Treating both as timestamps can shift date-only deadlines across days when users have different time zones. Existing task records already store `dueDate` as a UTC-noon marker.

## Decision

Keep `dueDate` as the selected calendar date encoded at UTC noon. Add nullable `dueAt` for the exact UTC instant when a task has a time. A null `dueAt` with a non-null `dueDate` means all-day; both null means no deadline. API deadline updates submit both fields. List requests include the browser's IANA time zone for local Today, Upcoming, and Overdue semantics.

## Consequences

- Existing date-only tasks remain all-day tasks without a migration.
- Timed deadlines can be compared as exact instants, independent of server time zone.
- The task schema, API validation, service filtering, and frontend form/display must preserve the paired-field and time-zone rules.
- A completed task is not overdue; tasks without deadlines are never overdue.
