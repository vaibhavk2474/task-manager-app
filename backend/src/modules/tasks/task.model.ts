import { Schema, model, type Types } from "mongoose";

export const taskStatuses = ["todo", "in_progress", "done"] as const;
export const taskPriorities = ["low", "medium", "high"] as const;
export type TaskStatus = (typeof taskStatuses)[number];
export type TaskPriority = (typeof taskPriorities)[number];

export interface TaskAttributes {
	ownerId: Types.ObjectId;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const taskSchema = new Schema({
	ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
	title: { type: String, required: true, trim: true, maxlength: 140 },
	description: { type: String, default: "", trim: true, maxlength: 4000 },
	status: { type: String, enum: taskStatuses, required: true, default: "todo" },
	priority: { type: String, enum: taskPriorities, required: true, default: "medium" },
	dueDate: { type: Date, default: null },
}, { timestamps: true });

taskSchema.index({ ownerId: 1, updatedAt: -1 });
taskSchema.index({ ownerId: 1, dueDate: 1 });

export const TaskModel = model("Task", taskSchema);
