import type { RequestHandler } from "express";
import { taskService, TaskServiceError } from "./task.service.js";
import type { TaskPriority, TaskStatus } from "./task.model.js";

const serializeTask = (task: { id: string; title: string; description: string; status: string; priority: string; dueDate?: Date | null; createdAt: Date; updatedAt: Date }) => ({
	id: task.id,
	title: task.title,
	description: task.description,
	status: task.status,
	priority: task.priority,
	dueDate: task.dueDate ? task.dueDate.toISOString().slice(0, 10) : null,
	createdAt: task.createdAt.toISOString(),
	updatedAt: task.updatedAt.toISOString(),
});

const respondWithError = (error: unknown, response: Parameters<RequestHandler>[1], next: Parameters<RequestHandler>[2]) => {
	if (error instanceof TaskServiceError) {
		response.status(error.status).json({ message: error.message });
		return;
	}
	next(error);
};

export const listTasks: RequestHandler = async (request, response, next) => {
	try {
		const filters = response.locals.taskFilters as { view: "all" | "today" | "upcoming" | "completed"; search: string };
		const result = await taskService.list(request.session.userId!, filters.view, filters.search);
		response.json({ tasks: result.tasks.map(serializeTask), counts: result.counts });
	} catch (error) { respondWithError(error, response, next); }
};

export const createTask: RequestHandler = async (request, response, next) => {
	try {
		const task = await taskService.create(request.session.userId!, request.body as { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: string | null });
		response.status(201).json({ task: serializeTask(task) });
	} catch (error) { respondWithError(error, response, next); }
};

export const updateTask: RequestHandler = async (request, response, next) => {
	try {
		const task = await taskService.update(request.session.userId!, String(request.params.id), request.body as Record<string, string | null>);
		response.json({ task: serializeTask(task) });
	} catch (error) { respondWithError(error, response, next); }
};

export const deleteTask: RequestHandler = async (request, response, next) => {
	try {
		await taskService.remove(request.session.userId!, String(request.params.id));
		response.status(204).end();
	} catch (error) { respondWithError(error, response, next); }
};
