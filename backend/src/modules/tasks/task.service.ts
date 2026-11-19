import type { QueryFilter } from "mongoose";
import { taskRepository } from "./task.repository.js";
import type { TaskAttributes, TaskPriority, TaskStatus } from "./task.model.js";

type TaskFilter = QueryFilter<TaskAttributes>;
type TaskView = "all" | "today" | "upcoming" | "completed";

const dayRange = (date: Date) => {
	const start = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
	return { start, end: new Date(start.getTime() + 24 * 60 * 60 * 1000) };
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const filterForView = (view: TaskView, now: Date): TaskFilter => {
	if (view === "completed") return { status: "done" };
	if (view === "today") {
		const { start, end } = dayRange(now);
		return { status: { $ne: "done" }, dueDate: { $gte: start, $lt: end } };
	}
	if (view === "upcoming") {
		const { end } = dayRange(now);
		return { status: { $ne: "done" }, dueDate: { $gte: end } };
	}
	return {};
};

const dueDateFromInput = (date: string | null | undefined) => date ? new Date(`${date}T12:00:00.000Z`) : null;

export const taskService = {
	async list(ownerId: string, view: TaskView, search: string) {
		const searchFilter: TaskFilter = search
			? { $or: [{ title: { $regex: escapeRegExp(search), $options: "i" } }, { description: { $regex: escapeRegExp(search), $options: "i" } }] }
			: {};
		const viewFilter = filterForView(view, new Date());
		const filter = { ...viewFilter, ...searchFilter };
		const { start, end } = dayRange(new Date());
		const [tasks, all, today, upcoming, completed] = await Promise.all([
			taskRepository.listForOwner(ownerId, filter),
			taskRepository.countForOwner(ownerId),
			taskRepository.countForOwner(ownerId, { status: { $ne: "done" }, dueDate: { $gte: start, $lt: end } }),
			taskRepository.countForOwner(ownerId, { status: { $ne: "done" }, dueDate: { $gte: end } }),
			taskRepository.countForOwner(ownerId, { status: "done" }),
		]);
		return { tasks, counts: { all, today, upcoming, completed } };
	},
	create(ownerId: string, data: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: string | null }) {
		return taskRepository.createForOwner(ownerId, { ...data, dueDate: dueDateFromInput(data.dueDate) });
	},
	async update(ownerId: string, id: string, data: Record<string, string | null>) {
		const changes = { ...data } as Record<string, unknown>;
		if ("dueDate" in changes) changes.dueDate = dueDateFromInput(changes.dueDate as string | null);
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
