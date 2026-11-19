import { useState, type FormEvent } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, InputLabel, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import type { Task, TaskInput, TaskPriority, TaskStatus } from "../types/task";
import { localDateKey, localTimeFromInstant } from "../utils/deadline";

interface TaskFormDialogProps {
	open: boolean;
	task: Task | null;
	isSaving: boolean;
	onClose: () => void;
	onSubmit: (data: TaskInput) => Promise<void>;
}

type TaskFormValues = Omit<TaskInput, "dueAt"> & { dueTime: string };
const initialForm: TaskFormValues = { title: "", description: "", status: "todo", priority: "medium", dueDate: null, dueTime: "" };

export const TaskFormDialog = ({ open, task, isSaving, onClose, onSubmit }: TaskFormDialogProps) => {
	const [form, setForm] = useState<TaskFormValues>(() => task ? { title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate, dueTime: localTimeFromInstant(task.dueAt) } : initialForm);
	const [error, setError] = useState("");
	const [deadlineErrors, setDeadlineErrors] = useState({ date: "", time: "" });

	const setField = <K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) => {
		setForm((current) => ({ ...current, [key]: value }));
		setError("");
	};
	const clock = new Date();
	const today = localDateKey(clock);
	const currentTime = `${String(clock.getHours()).padStart(2, "0")}:${String(clock.getMinutes()).padStart(2, "0")}`;
	const deadlineUnchanged = Boolean(task && form.dueDate === task.dueDate && form.dueTime === localTimeFromInstant(task.dueAt));
	const existingDeadlineIsPast = Boolean(task?.dueDate && (task.dueDate < today || (task.dueAt && new Date(task.dueAt).getTime() <= clock.getTime())));
	const preservingPastDeadline = existingDeadlineIsPast && deadlineUnchanged;
	const minDueDate = preservingPastDeadline && task?.dueDate ? task.dueDate : today;
	const minDueTime = form.dueDate === today ? (preservingPastDeadline ? form.dueTime : currentTime) : undefined;

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!form.title.trim()) { setError("Give your task a title."); return; }
		const selectedTime = form.dueDate && form.dueTime ? new Date(`${form.dueDate}T${form.dueTime}`) : null;
		const submitNow = new Date();
		const deadlineIsPastNow = Boolean(task?.dueDate && (task.dueDate < localDateKey(submitNow) || (task.dueAt && new Date(task.dueAt).getTime() <= submitNow.getTime())));
		const canKeepExistingPastDeadline = deadlineUnchanged && deadlineIsPastNow;
		const accurateDateError = form.dueDate && form.dueDate < localDateKey(submitNow) && !canKeepExistingPastDeadline ? "Choose today or a future date." : "";
		const timeError = selectedTime && selectedTime.getTime() <= submitNow.getTime() && !canKeepExistingPastDeadline ? "Choose a time later than now." : "";
		setDeadlineErrors({ date: accurateDateError, time: timeError });
		if (accurateDateError || timeError) return;
		setError("");
		try {
			const dueAt = deadlineUnchanged ? task?.dueAt ?? null : selectedTime?.toISOString() ?? null;
			await onSubmit({ title: form.title.trim(), description: form.description.trim(), status: form.status, priority: form.priority, dueDate: form.dueDate, dueAt });
		}
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
					<Box component="fieldset" sx={{ minWidth: 0, m: 0, p: 0, border: 0 }}>
						<Typography component="legend" variant="subtitle2" sx={{ mb: 1.5, p: 0, fontWeight: 750 }}>Deadline <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 400 }}>(optional)</Typography></Typography>
						<Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
							<TextField
								label="Due date"
								type="date"
								fullWidth
								value={form.dueDate ?? ""}
								error={Boolean(deadlineErrors.date)}
								onInvalid={(event) => { event.preventDefault(); setDeadlineErrors((current) => ({ ...current, date: "Choose today or a future date." })); }}
								onChange={(event) => {
									const dueDate = event.target.value || null;
									setForm((current) => ({ ...current, dueDate, dueTime: dueDate ? current.dueTime : "" }));
									setDeadlineErrors((current) => ({ ...current, date: "", time: dueDate ? current.time : "" }));
								}}
								helperText={deadlineErrors.date || (preservingPastDeadline ? "This task already has a past deadline. Keep it unchanged or choose today or a future date." : "Choose today or a future date. Leave blank for no deadline.")}
								slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minDueDate } }}
							/>
							<TextField
								label="Due time"
								type="time"
								fullWidth
								disabled={!form.dueDate}
								value={form.dueTime}
								error={Boolean(deadlineErrors.time)}
								onInvalid={(event) => { event.preventDefault(); setDeadlineErrors((current) => ({ ...current, time: "Choose a time later than now." })); }}
								onChange={(event) => { setField("dueTime", event.target.value); setDeadlineErrors((current) => ({ ...current, time: "" })); }}
								helperText={deadlineErrors.time || (preservingPastDeadline ? "This task already has a past deadline. Keep it unchanged or choose a future time." : form.dueDate === today ? "Optional. Choose a later time today, or leave blank for an all-day deadline." : form.dueDate ? "Optional. Leave blank for an all-day deadline." : "Choose a due date before setting a time.")}
								slotProps={{ inputLabel: { shrink: true }, htmlInput: { min: minDueTime, step: 60 } }}
							/>
						</Stack>
					</Box>
				</Stack>
			</DialogContent>
			<DialogActions sx={{ px: 3, pb: 2.5 }}><Button color="inherit" onClick={onClose} disabled={isSaving}>Cancel</Button><Button type="submit" form="task-form" variant="contained" disabled={isSaving}>{isSaving ? "Saving…" : task ? "Save changes" : "Create task"}</Button></DialogActions>
		</Dialog>
	);
};

