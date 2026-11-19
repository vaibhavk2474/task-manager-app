import { apiRequest } from "../../../shared/api/client";
import type { Task, TaskInput, TaskListResponse, TaskView } from "../types/task";

export const tasksApi = {
	list: (view: TaskView, search: string, page: number, pageSize: number, includePreviews = false) => {
		const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
		const params = new URLSearchParams({ view, search, timeZone, page: String(page), pageSize: String(pageSize), includePreviews: String(includePreviews) });
		return apiRequest<TaskListResponse>(`/api/tasks?${params.toString()}`);
	},
	create: (data: TaskInput) => apiRequest<{ task: Task }>("/api/tasks", { method: "POST", body: JSON.stringify(data) }),
	update: (id: string, data: Partial<TaskInput>) => apiRequest<{ task: Task }>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
	remove: (id: string) => apiRequest<void>(`/api/tasks/${id}`, { method: "DELETE" }),
};
