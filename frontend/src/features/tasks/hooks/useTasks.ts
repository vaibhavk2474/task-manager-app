import { useCallback, useEffect, useState } from "react";
import { tasksApi } from "../api/tasksApi";
import type { Task, TaskInput, TaskListResponse, TaskView } from "../types/task";

const emptyCounts: TaskListResponse["counts"] = { all: 0, today: 0, upcoming: 0, completed: 0 };

export const useTasks = (view: TaskView, search: string) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [counts, setCounts] = useState(emptyCounts);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	const refresh = useCallback(async () => {
		setIsLoading(true);
		setError("");
		try {
			const result = await tasksApi.list(view, search);
			setTasks(result.tasks);
			setCounts(result.counts);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "Could not load your tasks.");
		} finally { setIsLoading(false); }
	}, [view, search]);

	useEffect(() => {
		const timer = window.setTimeout(() => { void refresh(); }, 220);
		return () => window.clearTimeout(timer);
	}, [refresh]);

	const create = async (data: TaskInput) => { const result = await tasksApi.create(data); await refresh(); return result.task; };
	const update = async (id: string, data: Partial<TaskInput>) => { const result = await tasksApi.update(id, data); await refresh(); return result.task; };
	const remove = async (id: string) => { await tasksApi.remove(id); await refresh(); };

	return { tasks, counts, isLoading, error, refresh, create, update, remove };
};
