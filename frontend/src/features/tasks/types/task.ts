export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskView = "all" | "today" | "upcoming" | "completed";

export interface Task {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface TaskInput {
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string | null;
}

export interface TaskListResponse {
	tasks: Task[];
	counts: { all: number; today: number; upcoming: number; completed: number };
}
