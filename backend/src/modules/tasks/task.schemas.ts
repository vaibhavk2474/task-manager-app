import { z } from "zod";
import { taskPriorities, taskStatuses } from "./task.model.js";

const isValidTimeZone = (timeZone: string) => {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone });
		return true;
	} catch {
		return false;
	}
};

const taskTimeZone = z.string().trim().min(1).max(80).refine(isValidTimeZone, "Invalid time zone.");

const taskFields = {
	title: z.string().trim().min(1, "Task title is required.").max(140),
	description: z.string().trim().max(4000).default(""),
	status: z.enum(taskStatuses).default("todo"),
	priority: z.enum(taskPriorities).default("medium"),
	dueDate: z.union([z.iso.date(), z.null()]).default(null),
	dueAt: z.union([z.iso.datetime(), z.null()]).default(null),
};

export const createTaskSchema = z.object({ ...taskFields, timeZone: taskTimeZone }).strict().refine(
	(value) => value.dueAt === null || value.dueDate !== null,
	{ message: "A due time requires a due date.", path: ["dueAt"] },
);

export const updateTaskSchema = z.object({
	title: taskFields.title.optional(),
	description: taskFields.description.optional(),
	status: z.enum(taskStatuses).optional(),
	priority: z.enum(taskPriorities).optional(),
	dueDate: z.union([z.iso.date(), z.null()]).optional(),
	dueAt: z.union([z.iso.datetime(), z.null()]).optional(),
	timeZone: taskTimeZone.optional(),
}).strict()
	.refine((value) => Object.keys(value).some((key) => key !== "timeZone"), "Provide at least one field to update.")
	.superRefine((value, context) => {
		const hasDueDate = Object.hasOwn(value, "dueDate");
		const hasDueAt = Object.hasOwn(value, "dueAt");
		if (hasDueDate !== hasDueAt) {
			context.addIssue({ code: "custom", path: ["dueAt"], message: "Update the due date and time together." });
		}
		if (hasDueDate && !value.timeZone) {
			context.addIssue({ code: "custom", path: ["timeZone"], message: "A time zone is required when updating a deadline." });
		}
		if (value.dueAt && value.dueDate === null) {
			context.addIssue({ code: "custom", path: ["dueAt"], message: "A due time requires a due date." });
		}
	});

export const listTasksSchema = z.object({
	view: z.enum(["all", "today", "upcoming", "overdue", "completed"]).default("all"),
	search: z.string().trim().max(120).default(""),
	timeZone: z.string().trim().min(1).max(80).default("UTC").refine(isValidTimeZone, "Invalid time zone."),
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(25),
	includePreviews: z.enum(["true", "false"]).default("false").transform((value) => value === "true"),
});
export const taskIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Task was not found.");
