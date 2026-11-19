import { z } from "zod";
import { taskPriorities, taskStatuses } from "./task.model.js";

const taskFields = {
	title: z.string().trim().min(1, "Task title is required.").max(140),
	description: z.string().trim().max(4000).default(""),
	status: z.enum(taskStatuses).default("todo"),
	priority: z.enum(taskPriorities).default("medium"),
	dueDate: z.union([z.iso.date(), z.null()]).default(null),
};

export const createTaskSchema = z.object(taskFields).strict();
export const updateTaskSchema = z.object({
	title: taskFields.title.optional(),
	description: taskFields.description.optional(),
	status: z.enum(taskStatuses).optional(),
	priority: z.enum(taskPriorities).optional(),
	dueDate: z.union([z.iso.date(), z.null()]).optional(),
}).strict().refine((value) => Object.keys(value).length > 0, "Provide at least one field to update.");
export const listTasksSchema = z.object({
	view: z.enum(["all", "today", "upcoming", "completed"]).default("all"),
	search: z.string().trim().max(120).default(""),
});
export const taskIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Task was not found.");
