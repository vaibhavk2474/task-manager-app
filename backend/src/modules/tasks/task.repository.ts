import { TaskModel } from "./task.model.js";
import { Types, type QueryFilter } from "mongoose";
import type { TaskAttributes, TaskPriority, TaskStatus } from "./task.model.js";
import type { TaskSort } from "./task.schemas.js";

type TaskFilter = QueryFilter<TaskAttributes>;

const sortForTaskList = (sort: TaskSort): Record<string, 1 | -1> => {
	const tieBreakers = { updatedAt: -1 as const, _id: 1 as const };
	if (sort === "due_late") return { _deadlineMissing: 1 as const, dueDate: -1 as const, _dueTimeMissing: -1 as const, dueAt: -1 as const, ...tieBreakers };
	if (sort === "priority_high") return { _priorityRank: 1 as const, _deadlineMissing: 1 as const, dueDate: 1 as const, _dueTimeMissing: 1 as const, dueAt: 1 as const, ...tieBreakers };
	if (sort === "priority_low") return { _priorityRank: -1 as const, _deadlineMissing: 1 as const, dueDate: 1 as const, _dueTimeMissing: 1 as const, dueAt: 1 as const, ...tieBreakers };
	if (sort === "updated_newest") return { updatedAt: -1 as const, _id: 1 as const };
	if (sort === "updated_oldest") return { updatedAt: 1 as const, _id: 1 as const };
	if (sort === "title_asc") return { title: 1 as const, _id: 1 as const };
	if (sort === "title_desc") return { title: -1 as const, _id: 1 as const };
	return { _deadlineMissing: 1 as const, dueDate: 1 as const, _dueTimeMissing: 1 as const, dueAt: 1 as const, ...tieBreakers };
};

export const taskRepository = {
	async listForOwner(ownerId: string, filter: TaskFilter, pagination: { skip: number; limit: number }, sort: TaskSort = "due_soon") {
		const tasks = await TaskModel.aggregate([
			{ $match: { ownerId: new Types.ObjectId(ownerId), ...filter } },
			{ $addFields: {
				_deadlineMissing: { $cond: [{ $eq: ["$dueDate", null] }, 1, 0] },
				_dueTimeMissing: { $cond: [{ $eq: ["$dueAt", null] }, 1, 0] },
				_priorityRank: { $switch: { branches: [
					{ case: { $eq: ["$priority", "high"] }, then: 0 },
					{ case: { $eq: ["$priority", "medium"] }, then: 1 },
					{ case: { $eq: ["$priority", "low"] }, then: 2 },
				], default: 3 } },
			} },
			{ $sort: sortForTaskList(sort) },
			{ $skip: pagination.skip },
			{ $limit: pagination.limit },
		]).collation({ locale: "en", strength: 2 }).exec();
		return tasks.map((task) => TaskModel.hydrate(task));
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
