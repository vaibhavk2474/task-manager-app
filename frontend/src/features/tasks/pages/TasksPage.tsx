import { useEffect, useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Snackbar, Stack, Typography } from "@mui/material";
import { TaskShell } from "../../../shared/layouts/TaskShell";
import { OverviewDashboard } from "../components/OverviewDashboard";
import { TaskList } from "../components/TaskList";
import { TaskFormDialog } from "../components/TaskFormDialog";
import { useTasks } from "../hooks/useTasks";
import type { Task, TaskInput, TaskPageView, TaskView } from "../types/task";

const viewCopy: Record<TaskView, { title: string; description: string }> = {
	all: { title: "Your work, in focus.", description: "Make progress one thoughtful step at a time." },
	today: { title: "Make today count.", description: "A clear view of what is due today." },
	upcoming: { title: "Look ahead.", description: "See what is coming up and prepare at your pace." },
	overdue: { title: "Bring these back into focus.", description: "Open tasks past their deadline. Update or complete them when you are ready." },
	completed: { title: "Look what you have done.", description: "Small wins add up. Here is your completed work." },
};

export const TasksPage = () => {
	const [view, setView] = useState<TaskPageView>("overview");
	const [search, setSearch] = useState("");
	const listView: TaskView = view === "overview" ? "all" : view;
	const { tasks, counts, isLoading, error, create, update, remove } = useTasks(listView, view === "overview" ? "" : search);
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

	const openCreate = () => { setEditingTask(null); setDialogOpen(true); };
	const openEdit = (task: Task) => { setEditingTask(task); setDialogOpen(true); };
	const closeForm = () => { if (!saving) setDialogOpen(false); };
	const saveTask = async (data: TaskInput) => {
		setSaving(true);
		try {
			if (editingTask) await update(editingTask.id, data);
			else await create(data);
			setDialogOpen(false);
			setToast({ message: editingTask ? "Task updated." : "Task created.", severity: "success" });
		}
		finally { setSaving(false); }
	};
	const updateTask = async (id: string, data: Partial<TaskInput>) => {
		try { await update(id, data); setToast({ message: "Task updated.", severity: "success" }); }
		catch (caught) { setToast({ message: caught instanceof Error ? caught.message : "Could not update the task.", severity: "error" }); }
	};
	const confirmDelete = async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try { await remove(deleteTarget.id); setToast({ message: "Task deleted.", severity: "success" }); setDeleteTarget(null); }
		catch (caught) { setToast({ message: caught instanceof Error ? caught.message : "Could not delete the task.", severity: "error" }); }
		finally { setDeleting(false); }
	};

	const dashboard = view === "overview";
	const copy = viewCopy[view === "overview" ? "all" : view];

	return (
		<TaskShell view={view} onViewChange={setView} counts={counts} search={search} onSearchChange={setSearch} onCreateTask={openCreate} showSearch={!dashboard}>
			{dashboard ? (
				<>
					{error && <Alert severity="error" sx={{ maxWidth: 1120, mx: "auto", mb: 2 }}>{error}</Alert>}
					<OverviewDashboard tasks={tasks} counts={counts} isLoading={isLoading} now={now} onViewChange={setView} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
				</>
			) : (
				<Box sx={{ maxWidth: 1050, mx: "auto" }}>
					<Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" }, justifyContent: "space-between", gap: 2, mb: 3.5 }}>
						<Box>
							<Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: ".13em" }}>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Typography>
							<Typography variant="h3" component="h1" sx={{ mt: 0.4, fontSize: { xs: 32, sm: 40 } }}>{copy.title}</Typography>
							<Typography color="text.secondary" sx={{ mt: 0.7 }}>{copy.description}</Typography>
						</Box>
						<Typography variant="body2" color="text.secondary" sx={{ bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 99, px: 1.5, py: 0.8 }}>
							{counts.all - counts.completed} open {counts.all - counts.completed === 1 ? "task" : "tasks"}
						</Typography>
					</Stack>

					<Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
						<Box><Typography variant="h6" sx={{ fontWeight: 800 }}>{view === "all" ? "Your task list" : copy.title}</Typography><Typography variant="body2" color="text.secondary">{search ? `Matching “${search}”` : "Keep the important things moving."}</Typography></Box>
						<Typography variant="caption" color="text.secondary">{tasks.length} {tasks.length === 1 ? "task" : "tasks"}</Typography>
					</Stack>
					{error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
					<TaskList tasks={tasks} view={view} isLoading={isLoading} search={search} now={now} onCreate={openCreate} onEdit={openEdit} onDelete={setDeleteTarget} onUpdate={updateTask} />
				</Box>
			)}

			{dialogOpen && <TaskFormDialog key={editingTask?.id ?? "new-task"} open task={editingTask} isSaving={saving} onClose={closeForm} onSubmit={saveTask} />}
			<Dialog open={Boolean(deleteTarget)} onClose={() => !deleting && setDeleteTarget(null)}>
				<DialogTitle sx={{ fontWeight: 800 }}>Delete this task?</DialogTitle>
				<DialogContent><Typography color="text.secondary">“{deleteTarget?.title}” will be permanently removed from your workspace.</Typography></DialogContent>
				<DialogActions sx={{ p: 2.5, pt: 1 }}><Button onClick={() => setDeleteTarget(null)} disabled={deleting}>Keep task</Button><Button color="error" variant="contained" onClick={() => void confirmDelete()} disabled={deleting}>{deleting ? "Deleting…" : "Delete task"}</Button></DialogActions>
			</Dialog>
			<Snackbar open={Boolean(toast)} autoHideDuration={3600} onClose={() => setToast(null)} anchorOrigin={{ vertical: "bottom", horizontal: "right" }}>
				{toast ? <Alert severity={toast.severity} variant="filled" onClose={() => setToast(null)}>{toast.message}</Alert> : undefined}
			</Snackbar>
		</TaskShell>
	);
};
