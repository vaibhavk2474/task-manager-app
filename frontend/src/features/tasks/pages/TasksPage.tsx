import { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Pagination, Snackbar, Stack, Typography } from "@mui/material";
import { TaskShell } from "../../../shared/layouts/TaskShell";
import { OverviewDashboard } from "../components/OverviewDashboard";
import { TaskFilters } from "../components/TaskFilters";
import { TaskSortSelect } from "../components/TaskSortSelect";
import { TaskList } from "../components/TaskList";
import { TaskTable } from "../components/TaskTable";
import { TaskViewToggle, type TaskDisplayMode } from "../components/TaskViewToggle";
import { TaskFormDialog } from "../components/TaskFormDialog";
import { useTasks } from "../hooks/useTasks";
import type { Task, TaskInput, TaskListResponse, TaskPageView, TaskSort, TaskView } from "../types/task";

const emptyPreviews: NonNullable<TaskListResponse["previews"]> = { today: [], upcoming: [], overdue: [] };
const emptyCounts: TaskListResponse["counts"] = { all: 0, today: 0, upcoming: 0, overdue: 0, completed: 0 };

export const TasksPage = () => {
	const [view, setView] = useState<TaskPageView>("overview");
	const [search, setSearch] = useState("");
	const [displayMode, setDisplayMode] = useState<TaskDisplayMode>("cards");
	const [sort, setSort] = useState<TaskSort>("due_soon");
	const [page, setPage] = useState(1);
	const dashboard = view === "overview";
	const pageSize = dashboard ? 1 : displayMode === "cards" ? 8 : 10;
	const listView: TaskView = view === "overview" ? "all" : view;
	const { tasks, counts, pagination, previews, isLoading, error, hasLoaded, refresh, create, update, remove } = useTasks(listView, dashboard ? "" : search, page, pageSize, dashboard, dashboard ? "due_soon" : sort);
	const currentLoading = isLoading || (!hasLoaded && !error);
	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [saving, setSaving] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
	const [deleting, setDeleting] = useState(false);
	const [toast, setToast] = useState<{ message: string; severity: "success" | "error" } | null>(null);
	const [now, setNow] = useState(() => new Date());
	useEffect(() => {
		const timer = window.setInterval(() => setNow(new Date()), 60_000);
		return () => window.clearInterval(timer);
	}, []);
	const navigate = (nextView: TaskPageView) => {
		if (view === "overview" && nextView !== "overview") setSearch("");
		setPage(1);
		setView(nextView);
	};
	const selectFilter = (nextView: TaskView) => { setPage(1); setView(nextView); };
	const changeSearch = (nextSearch: string) => { setPage(1); setSearch(nextSearch); };
	const changeDisplayMode = (nextMode: TaskDisplayMode) => { setPage(1); setDisplayMode(nextMode); };
	const changeSort = (nextSort: TaskSort) => { setPage(1); setSort(nextSort); };

	const openCreate = () => { setEditingTask(null); setDialogOpen(true); };
	const openEdit = (task: Task) => { setEditingTask(task); setDialogOpen(true); };
	const closeForm = () => { if (!saving) setDialogOpen(false); };
	const saveTask = async (data: TaskInput) => {
		setSaving(true);
		try {
			if (editingTask) await update(editingTask.id, data);
			else await create(data);
			setPage(1);
			setDialogOpen(false);
			setToast({ message: editingTask ? "Task updated." : "Task created.", severity: "success" });
		}
		finally { setSaving(false); }
	};
	const updateTask = async (id: string, data: Partial<TaskInput>) => {
		try { await update(id, data); setPage(1); setToast({ message: "Task updated.", severity: "success" }); }
		catch (caught) { setToast({ message: caught instanceof Error ? caught.message : "Could not update the task.", severity: "error" }); }
	};
	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try { await remove(deleteTarget.id); setPage(1); setToast({ message: "Task deleted.", severity: "success" }); setDeleteTarget(null); }
		catch (caught) { setToast({ message: caught instanceof Error ? caught.message : "Could not delete the task.", severity: "error" }); }
		finally { setDeleting(false); }
	};

	const pageCount = Math.max(1, pagination.totalPages);
	const currentPage = pagination.page;
	const rangeStart = pagination.totalItems ? (currentPage - 1) * pagination.pageSize + 1 : 0;
	const rangeEnd = Math.min(currentPage * pagination.pageSize, pagination.totalItems);

	return (
		<TaskShell view={view} onViewChange={navigate} search={search} onSearchChange={changeSearch} onCreateTask={openCreate} showSearch={!dashboard}>
			{dashboard ? (
				<>
					{error && <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void refresh()}>Try again</Button>} sx={{ maxWidth: 1120, mx: "auto", mb: 2 }}>{error}</Alert>}
					{!hasLoaded && error ? null : <OverviewDashboard previews={hasLoaded ? previews ?? emptyPreviews : emptyPreviews} counts={hasLoaded ? counts : emptyCounts} isLoading={currentLoading} now={now} onViewChange={navigate} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />}
				</>
			) : (
				<Box sx={{ maxWidth: 1120, mx: "auto" }}>
					<Stack spacing={2.5} sx={{ mb: 3 }}>
						<Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 2 }}>
							<Box sx={{ minWidth: 0, flex: "1 1 auto" }}>
								<Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: ".13em" }}>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Typography>
								<Typography variant="h3" component="h1" sx={{ mt: 0.4, fontSize: { xs: 32, sm: 40 } }}>All tasks</Typography>
								<Typography color="text.secondary" sx={{ mt: 0.7 }}>Filter your work by deadline or completion status.</Typography>
							</Box>
							<TaskViewToggle value={displayMode} onChange={changeDisplayMode} />
						</Stack>
						<Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ minWidth: 0, alignItems: { xs: "stretch", md: "center" }, justifyContent: "space-between" }}>
							<TaskFilters view={listView} counts={counts} onChange={selectFilter} />
							<TaskSortSelect value={sort} onChange={changeSort} />
						</Stack>
					</Stack>

					{search && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, overflowWrap: "anywhere" }}>Search results for “{search}”</Typography>}
					{error && <Alert severity="error" role="alert" action={<Button color="inherit" size="small" onClick={() => void refresh()}>Try again</Button>} sx={{ mb: 2 }}>{error}</Alert>}
					{!hasLoaded && error ? null : !hasLoaded ? (
						<TaskList tasks={[]} view={listView} isLoading={currentLoading} search={search} now={now} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
					) : pagination.totalItems === 0 ? (
						<TaskList tasks={[]} view={listView} isLoading={isLoading} search={search} now={now} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
					) : displayMode === "cards" ? (
						<TaskList tasks={tasks} view={listView} isLoading={isLoading} search={search} now={now} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
					) : (
						<TaskTable tasks={tasks} isLoading={isLoading} now={now} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
					)}
					{hasLoaded && pagination.totalItems > 0 && <Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "center" }, justifyContent: "space-between", gap: 1.5, mt: 2.5 }}>
						<Typography variant="body2" color="text.secondary" aria-live="polite">Showing {rangeStart}–{rangeEnd} of {pagination.totalItems} tasks</Typography>
						{pageCount > 1 && <Pagination count={pageCount} page={currentPage} onChange={(_event, nextPage) => setPage(nextPage)} color="primary" size="small" shape="rounded" aria-label="Task pages" />}
					</Stack>}
				</Box>
			)}

			{dialogOpen && <TaskFormDialog key={editingTask?.id ?? "new-task"} open task={editingTask} isSaving={saving} onClose={closeForm} onSubmit={saveTask} />}
			<Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
				<DialogTitle sx={{ fontWeight: 800 }}>Delete this task?</DialogTitle>
				<DialogContent><Typography color="text.secondary">“{deleteTarget?.title}” will be permanently removed from your workspace.</Typography></DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}><Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Keep task</Button><Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleting}>{deleting ? "Deleting…" : "Delete task"}</Button></DialogActions>
			</Dialog>
			<Snackbar open={Boolean(toast)} autoHideDuration={6000} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
				{toast ? <Alert role={toast.severity === "error" ? "alert" : "status"} severity={toast.severity} variant="filled" onClose={() => setToast(null)}>{toast.message}</Alert> : undefined}
			</Snackbar>
		</TaskShell>
	);
};
