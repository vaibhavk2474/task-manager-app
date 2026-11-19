import { useState, type FormEvent } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "../types/task";

interface TaskFormDialogProps {
	open: boolean;
	task: Task | null;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (data: TaskInput) => Promise<void>;
}

const initialForm: TaskInput = { title: "", description: "", status: "todo", priority: "medium", dueDate: null };

export const TaskFormDialog = ({ open, task, isSaving, onClose, onSubmit }: TaskFormDialogProps) => {
	const [form, setForm] = useState<TaskInput>(() => task ? { title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate } : initialForm);
	const [error, setError] = useState("");

	const setField = <K extends keyof TaskInput>(key: K, value: TaskInput[K]) => setForm((current) => ({ ...current, [key]: value }));
	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.title.trim()) { setError("Give your task a title."); return; }
		setError("");
		try { await onSubmit({ ...form, title: form.title.trim(), description: form.description.trim() }); }
		catch (caught) { setError(caught instanceof Error ? caught.message : "Could not save the task."); }
	};

	return (
		<Dialog open={open} onClose={isSaving ? undefined : onClose} fullWidth maxWidth="sm">
			<DialogTitle sx={{ pb: 0.5, fontWeight: 800 }}>{task ? "Edit task" : "Create a task"}</DialogTitle>
			<DialogContent sx={{ pt: "18px !important" }}>
				<Stack component="form" id="task-form" spacing={2.25} onSubmit={submit}>
					{error && <Alert severity="error">{error}</Alert>}
					<TextField autoFocus label="Task title" placeholder="What needs to get done?" required fullWidth value={form.title} onChange={(event) => setField("title", event.target.value)} slotProps={{ htmlInput: { maxLength: 140 } }} />
					<TextField label="Details" placeholder="Add a little context or a next step…" fullWidth multiline minRows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} slotProps={{ htmlInput: { maxLength: 4000 } }} />
					<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
						<FormControl fullWidth><InputLabel id="task-status-label">Status</InputLabel><Select labelId="task-status-label" label="Status" value={form.status} onChange={(event) => setField("status", event.target.value as TaskStatus)}><MenuItem value="todo">To do</MenuItem><MenuItem value="in_progress">In progress</MenuItem><MenuItem value="done">Done</MenuItem></Select></FormControl>
						<FormControl fullWidth><InputLabel id="task-priority-label">Priority</InputLabel><Select labelId="task-priority-label" label="Priority" value={form.priority} onChange={(event) => setField("priority", event.target.value as TaskPriority)}><MenuItem value="low">Low</MenuItem><MenuItem value="medium">Medium</MenuItem><MenuItem value="high">High</MenuItem></Select></FormControl>
					</Stack>
					<TextField label="Due date" type="date" fullWidth value={form.dueDate ?? ""} onChange={(event) => setField("dueDate", event.target.value || null)} slotProps={{ inputLabel: { shrink: true } }} />
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}><Button color="inherit" onClick={onClose} disabled={isSaving}>Cancel</Button><Button type="submit" form="task-form" variant="contained" disabled={isSaving}>{isSaving ? "Saving…" : task ? "Save changes" : "Create task"}</Button></DialogActions>
		</Dialog>
	);
};

