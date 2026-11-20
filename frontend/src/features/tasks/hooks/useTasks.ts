import { useCallback, useEffect, useState } from "react";
import { tasksApi } from "../api/tasksApi";
import type { Task, TaskInput, TaskListResponse, TaskView } from "../types/task";

const emptyCounts: TaskListResponse["counts"] = { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 };
const emptyPagination: TaskListResponse["pagination"] = { page: 1, pageSize: 25, totalItems: 0, totalPages: 0 };

export const useTasks = (view: TaskView, search: string, page: number, pageSize: number, includePreviews = false) => {
	const queryKey = JSON.stringify([view, search, page, pageSize, includePreviews]);
	const [tasks, setTasks] = useState<Task[]>([]);
	const [counts, setCounts] = useState(emptyCounts);
	const [pagination, setPagination] = useState(emptyPagination);
	const [previews, setPreviews] = useState<TaskListResponse["previews"]>();
	const [isLoading, setIsLoading] = useState(true);
	const [requestError, setRequestError] = useState<{ queryKey: string; message: string } | null>(null);
	const [loadedQuery, setLoadedQuery] = useState("");

	const refresh = useCallback(async (background = false) => {
		if (!background) setIsLoading(true);
		setRequestError(null);
		try {
			const result = await tasksApi.list(view, search, page, pageSize, includePreviews);
			setTasks(result.tasks);
			setCounts(result.counts);
			setPagination(result.pagination);
			setPreviews(result.previews);
			setLoadedQuery(queryKey);
		} catch (caught) {
			setRequestError({ queryKey, message: caught instanceof Error ? caught.message : "Could not load your tasks." });
		} finally { if (!background) setIsLoading(false); }
	}, [view, search, page, pageSize, includePreviews, queryKey]);

	useEffect(() => {
		const timer = window.setTimeout(() => { void refresh(); }, 220);
		return () => window.clearTimeout(timer);
	}, [refresh]);

	useEffect(() => {
		const timer = window.setInterval(() => { void refresh(true); }, 60_000);
		return () => window.clearInterval(timer);
	}, [refresh]);

	const create = async (data: TaskInput) => { const result = await tasksApi.create(data); await refresh(); return result.task; };
	const update = async (id: string, data: Partial<TaskInput>) => { const result = await tasksApi.update(id, data); await refresh(); return result.task; };
	const remove = async (id: string) => { await tasksApi.remove(id); await refresh(); };

	const error = requestError?.queryKey === queryKey ? requestError.message : "";
	return { tasks, counts, pagination, previews, isLoading, error, hasLoaded: loadedQuery === queryKey, refresh, create, update, remove };
};
