export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";
export type TaskView = "all" | "today" | "upcoming" | "overdue" | "completed";
export type TaskPageView = "overview" | TaskView;
export type TaskSort = "due_soon" | "due_late" | "priority_high" | "priority_low" | "updated_newest" | "updated_oldest" | "title_asc" | "title_desc";

export interface Task {
	id: string;
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string | null;
	dueAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface TaskInput {
	title: string;
	description: string;
	status: TaskStatus;
	priority: TaskPriority;
	dueDate: string | null;
	dueAt: string | null;
}

export interface TaskListResponse {
	tasks: Task[];
	counts: { all: number; today: number; upcoming: number; overdue: number; completed: number };
	pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
	previews?: { today: Task[]; upcoming: Task[]; overdue: Task[] };
}
