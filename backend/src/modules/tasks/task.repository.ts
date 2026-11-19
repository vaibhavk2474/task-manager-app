import { TaskModel } from "./task.model.js";
import { Types, type QueryFilter } from "mongoose";
import type { TaskAttributes, TaskPriority, TaskStatus } from "./task.model.js";

type TaskFilter = QueryFilter<TaskAttributes>;

export const taskRepository = {
	listForOwner(ownerId: string, filter: TaskFilter, pagination: { skip: number; limit: number }) {
		return TaskModel.find({ ownerId: new Types.ObjectId(ownerId), ...filter })
			.sort({ dueDate: 1, dueAt: 1, updatedAt: -1, _id: 1 })
			.skip(pagination.skip)
			.limit(pagination.limit);
	},
	countForOwner(ownerId: string, filter: TaskFilter = {}) {
		return TaskModel.countDocuments({ ownerId: new Types.ObjectId(ownerId), ...filter });
	},
	findOwned(ownerId: string, id: string) {
		return TaskModel.findOne({ _id: id, ownerId: new Types.ObjectId(ownerId) });
	},
	createForOwner(ownerId: string, data: { title: string; description: string; status: TaskStatus; priority: TaskPriority; dueDate: Date | null; dueAt: Date | null }) {
		return TaskModel.create({ ...data, ownerId: new Types.ObjectId(ownerId) });
	},
	updateOwned(ownerId: string, id: string, data: Record<string, unknown>) {
		return TaskModel.findOneAndUpdate({ _id: id, ownerId: new Types.ObjectId(ownerId) }, { $set: data }, { new: true, runValidators: true });
	},
	deleteOwned(ownerId: string, id: string) {
		return TaskModel.findOneAndDelete({ _id: id, ownerId: new Types.ObjectId(ownerId) });
	},
};
