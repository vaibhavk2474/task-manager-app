import type { QueryFilter } from "mongoose";
import { taskRepository } from "./task.repository.js";
import type { TaskAttributes, TaskPriority, TaskStatus } from "./task.model.js";

type TaskFilter = QueryFilter<TaskAttributes>;
type TaskView = "all" | "today" | "upcoming" | "overdue" | "completed";

interface ZonedDayWindow {
	todayKey: string;
	todayMarker: Date;
	tomorrowMarker: Date;
	start: Date;
	end: Date;
}

const datePartsInTimeZone = (date: Date, timeZone: string) => {
	const parts = new Intl.DateTimeFormat("en-US", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hourCycle: "h23",
	}).formatToParts(date);
	const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value);
	return { year: value("year"), month: value("month"), day: value("day"), hour: value("hour"), minute: value("minute"), second: value("second") };
};

const dateKeyFromParts = ({ year, month, day }: Pick<ReturnType<typeof datePartsInTimeZone>, "year" | "month" | "day">) =>
	`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

const nextDateKey = (dateKey: string) => {
	const next = new Date(`${dateKey}T12:00:00.000Z`);
	next.setUTCDate(next.getUTCDate() + 1);
	return next.toISOString().slice(0, 10);
};

const dateMarker = (dateKey: string) => new Date(`${dateKey}T12:00:00.000Z`);

const timeZoneOffsetAt = (instant: Date, timeZone: string) => {
	const parts = datePartsInTimeZone(instant, timeZone);
	return Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second) - instant.getTime();
};

const localMidnightAsUtc = (dateKey: string, timeZone: string) => {
	const [year = 1970, month = 1, day = 1] = dateKey.split("-").map(Number);
	const targetAsUtc = Date.UTC(year, month - 1, day);
	let candidate = targetAsUtc;
	for (let attempt = 0; attempt < 4; attempt += 1) {
		const adjusted = targetAsUtc - timeZoneOffsetAt(new Date(candidate), timeZone);
		if (adjusted === candidate) break;
		candidate = adjusted;
	}
	return new Date(candidate);
};

const getZonedDayWindow = (now: Date, timeZone: string): ZonedDayWindow => {
	const todayKey = dateKeyFromParts(datePartsInTimeZone(now, timeZone));
	const tomorrowKey = nextDateKey(todayKey);
	return {
		todayKey,
		todayMarker: dateMarker(todayKey),
		tomorrowMarker: dateMarker(tomorrowKey),
		start: localMidnightAsUtc(todayKey, timeZone),
		end: localMidnightAsUtc(tomorrowKey, timeZone),
	};
};

const filtersForView = (view: TaskView, now: Date, window: ZonedDayWindow): TaskFilter => {
	const timedDeadlineStart = now.getTime() > window.start.getTime() ? now : window.start;
	if (view === "completed") return { status: "done" };
	if (view === "today") {
		return {
			status: { $ne: "done" },
			$or: [
				{ dueAt: { $gte: timedDeadlineStart, $lt: window.end } },
				{ dueAt: null, dueDate: { $gte: window.todayMarker, $lt: window.tomorrowMarker } },
			],
		};
	}
	if (view === "upcoming") {
		return {
			status: { $ne: "done" },
			$or: [
				{ dueAt: { $gte: window.end } },
				{ dueAt: null, dueDate: { $gte: window.tomorrowMarker } },
			],
		};
	}
	if (view === "overdue") {
		return {
			status: { $ne: "done" },
			$or: [
				{ dueAt: { $lt: now } },
				{ dueAt: null, dueDate: { $ne: null, $lt: window.todayMarker } },
			],
		};
	}
	return {};
};

const dateFromInput = (date: string | null | undefined) => date ? new Date(`${date}T12:00:00.000Z`) : null;
const dueAtFromInput = (dateTime: string | null | undefined) => dateTime ? new Date(dateTime) : null;
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const taskService = {
	async list(ownerId: string, view: TaskView, search: string, timeZone: string, requestedPage: number, pageSize: number, includePreviews: boolean) {
		const now = new Date();
		const window = getZonedDayWindow(now, timeZone);
		const searchFilter: TaskFilter = search
			? { $or: [{ title: { $regex: escapeRegExp(search), $options: "i" } }, { description: { $regex: escapeRegExp(search), $options: "i" } }] }
			: {};
		const viewFilter = filtersForView(view, now, window);
		const conditions = [viewFilter, searchFilter].filter((filter) => Object.keys(filter).length > 0);
		const filter: TaskFilter = conditions.length > 1 ? { $and: conditions } : conditions[0] ?? {};
		const openTasks: TaskFilter = { status: { $ne: "done" } };
		const timedDeadlineStart = now.getTime() > window.start.getTime() ? now : window.start;
		const todayFilter: TaskFilter = {
			...openTasks,
			$or: [
				{ dueAt: { $gte: timedDeadlineStart, $lt: window.end } },
				{ dueAt: null, dueDate: { $gte: window.todayMarker, $lt: window.tomorrowMarker } },
			],
		};
		const upcomingFilter: TaskFilter = {
			...openTasks,
			$or: [
				{ dueAt: { $gte: window.end } },
				{ dueAt: null, dueDate: { $gte: window.tomorrowMarker } },
			],
		};
		const overdueFilter: TaskFilter = {
			...openTasks,
			$or: [
				{ dueAt: { $lt: now } },
				{ dueAt: null, dueDate: { $ne: null, $lt: window.todayMarker } },
			],
		};
		const [all, today, upcoming, overdue, completed, matchingSearchTotal] = await Promise.all([
			taskRepository.countForOwner(ownerId),
			taskRepository.countForOwner(ownerId, todayFilter),
			taskRepository.countForOwner(ownerId, upcomingFilter),
			taskRepository.countForOwner(ownerId, overdueFilter),
			taskRepository.countForOwner(ownerId, { status: "done" }),
			search ? taskRepository.countForOwner(ownerId, filter) : Promise.resolve(null),
		]);
		const counts = { all, today, upcoming, overdue, completed };
		const matchingViewTotal = search ? matchingSearchTotal ?? 0 : counts[view];
		const totalPages = Math.ceil(matchingViewTotal / pageSize);
		const page = Math.min(requestedPage, Math.max(1, totalPages));
		const [tasks, previews] = await Promise.all([
			taskRepository.listForOwner(ownerId, filter, { skip: (page - 1) * pageSize, limit: pageSize }),
			includePreviews ? Promise.all([
				taskRepository.listForOwner(ownerId, todayFilter, { skip: 0, limit: 4 }),
				taskRepository.listForOwner(ownerId, upcomingFilter, { skip: 0, limit: 4 }),
				taskRepository.listForOwner(ownerId, overdueFilter, { skip: 0, limit: 4 }),
			]).then(([todayTasks, upcomingTasks, overdueTasks]) => ({ today: todayTasks, upcoming: upcomingTasks, overdue: overdueTasks })) : Promise.resolve(undefined),
		]);
		return {
			tasks,
			counts,
			pagination: { page, pageSize, totalItems: matchingViewTotal, totalPages },
			...(previews ? { previews } : {}),
		};
	},
	create(ownerId: string, data: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: string | null; dueAt: string | null; timeZone: string }) {
		const validationError = deadlineValidationError(data.dueDate, data.dueAt, data.timeZone, new Date());
		if (validationError) throw new TaskServiceError(validationError, 400);
		return taskRepository.createForOwner(ownerId, {
			title: data.title,
			description: data.description,
			status: data.status,
			priority: data.priority,
			dueDate: dateFromInput(data.dueDate),
			dueAt: dueAtFromInput(data.dueAt),
		});
	},
	async update(ownerId: string, id: string, data: Record<string, unknown>) {
		const changes = { ...data };
		const timeZone = changes.timeZone as string | undefined;
		delete changes.timeZone;
		if ("dueDate" in changes) {
			const existing = await taskRepository.findOwned(ownerId, id);
			if (!existing) throw new TaskServiceError("Task not found.", 404);
			const nextDueDate = changes.dueDate as string | null;
			const nextDueAt = changes.dueAt as string | null;
			const existingDueDate = existing.dueDate?.toISOString().slice(0, 10) ?? null;
			const existingDueAt = existing.dueAt?.getTime() ?? null;
			const nextDueAtInstant = nextDueAt ? new Date(nextDueAt).getTime() : null;
			const deadlineUnchanged = nextDueDate === existingDueDate && nextDueAtInstant === existingDueAt;
			if (!deadlineUnchanged) {
				const validationError = deadlineValidationError(nextDueDate, nextDueAt, timeZone ?? "UTC", new Date());
				if (validationError) throw new TaskServiceError(validationError, 400);
			}
		}
		if ("dueDate" in changes) changes.dueDate = dateFromInput(changes.dueDate as string | null);
		if ("dueAt" in changes) changes.dueAt = dueAtFromInput(changes.dueAt as string | null);
		const task = await taskRepository.updateOwned(ownerId, id, changes);
		if (!task) throw new TaskServiceError("Task not found.", 404);
		return task;
	},
	async remove(ownerId: string, id: string) {
		const task = await taskRepository.deleteOwned(ownerId, id);
		if (!task) throw new TaskServiceError("Task not found.", 404);
	},
};

export class TaskServiceError extends Error {
	constructor(message: string, public readonly status: number) {
		super(message);
		this.name = "TaskServiceError";
	}
}

const deadlineValidationError = (dueDate: string | null, dueAt: string | null, timeZone: string, now: Date) => {
	const today = dateKeyFromParts(datePartsInTimeZone(now, timeZone));
	if (dueDate && dueDate < today) return "Due date must be today or later.";
	if (dueAt && new Date(dueAt).getTime() <= now.getTime()) return "Due time must be later than the current time.";
	return null;
};
