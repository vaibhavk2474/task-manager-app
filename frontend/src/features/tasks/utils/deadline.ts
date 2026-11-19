import type { Task } from "../types/task";

export const localDateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export const isTaskOverdue = (task: Pick<Task, "status" | "dueDate" | "dueAt">, now: Date) => {
	if (task.status === "done" || !task.dueDate) return false;
	if (task.dueAt) return new Date(task.dueAt).getTime() < now.getTime();
	return task.dueDate < localDateKey(now);
};

const formatDateKey = (dateKey: string) => {
	const [year, month, day] = dateKey.split("-").map(Number);
	return new Date(year, month - 1, day, 12).toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const formatTime = (date: Date) => date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

export const taskDueLabel = (task: Pick<Task, "status" | "dueDate" | "dueAt">, now: Date) => {
	if (!task.dueDate) return "No due date";
	if (task.dueAt) {
		const deadline = new Date(task.dueAt);
		const isToday = localDateKey(deadline) === localDateKey(now);
		const timeLabel = formatTime(deadline);
		if (isTaskOverdue(task, now)) return `Overdue · ${isToday ? `today at ${timeLabel}` : `${formatDateKey(localDateKey(deadline))} at ${timeLabel}`}`;
		return isToday ? `Today at ${timeLabel}` : `${formatDateKey(localDateKey(deadline))} at ${timeLabel}`;
	}

	if (task.dueDate === localDateKey(now)) return "Due today";
	const dateLabel = formatDateKey(task.dueDate);
	return isTaskOverdue(task, now) ? `Overdue · ${dateLabel}` : `Due ${dateLabel}`;
};

export const localTimeFromInstant = (instant: string | null) => {
	if (!instant) return "";
	const date = new Date(instant);
	return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};
