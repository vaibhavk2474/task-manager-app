import { Box, Button, Card, CardContent, Checkbox, Chip, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Task, TaskInput, TaskView } from "../types/task";

interface TaskListProps {
	tasks: Task[];
	view: TaskView;
	isLoading: boolean;
	search: string;
	onCreate: () => void;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
	onUpdate: (taskId: string, data: Partial<TaskInput>) => Promise<unknown>;
}

const priorityColor = (priority: Task["priority"]): "default" | "warning" | "error" => priority === "high" ? "error" : priority === "medium" ? "warning" : "default";
const statusLabel = (status: Task["status"]) => status === "in_progress" ? "In progress" : status === "done" ? "Completed" : "To do";

const dateKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const dueLabel = (dueDate: string | null) => {
	if (!dueDate) return "No due date";
	const today = dateKey(new Date());
	const due = new Date(`${dueDate}T12:00:00`);
	if (dueDate === today) return "Due today";
	if (dueDate < today) return `Overdue · ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
	return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
};

export const TaskList = ({ tasks, view, isLoading, search, onCreate, onEdit, onDelete, onUpdate }: TaskListProps) => {
	if (isLoading && tasks.length === 0) return <Box sx={{ py: 10, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;
	if (!tasks.length) {
		return (
			<Card variant="outlined" sx={{ borderStyle: "dashed", bgcolor: "transparent", textAlign: "center", py: 7, px: 2 }}>
				<CardContent>
					<Box sx={{ width: 58, height: 58, mx: "auto", mb: 2, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "action.hover", color: "primary.main" }}><AddRoundedIcon fontSize="large" /></Box>
					<Typography variant="h6" gutterBottom sx={{ fontWeight: 800 }}>{search ? "No matching tasks" : view === "completed" ? "Nothing completed yet" : "A clear space to begin"}</Typography>
					<Typography color="text.secondary" sx={{ mb: 2.5 }}>{search ? "Try another search or clear the search field." : "Add a task and give your day a little direction."}</Typography>
					{view !== "completed" && !search && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreate}>Create your first task</Button>}
				</CardContent>
			</Card>
		);
	}

	return (
		<Stack spacing={1.25} sx={{ opacity: isLoading ? 0.6 : 1, transition: "opacity 160ms ease" }}>
			{tasks.map((task) => (
				<Card key={task.id} variant="outlined" sx={{ borderColor: "divider", transition: "transform 140ms ease, box-shadow 140ms ease", "&:hover": { transform: "translateY(-1px)", boxShadow: 2 } }}>
					<CardContent sx={{ p: "18px 20px !important" }}>
						<Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
							<Checkbox checked={task.status === "done"} onChange={() => { void onUpdate(task.id, { status: task.status === "done" ? "todo" : "done" }); }} slotProps={{ input: { "aria-label": `${task.status === "done" ? "Reopen" : "Complete"} ${task.title}` } }} sx={{ mt: -0.5, ml: -1 }} />
							<Box sx={{ minWidth: 0, flex: 1, cursor: "pointer" }} role="button" tabIndex={0} onClick={() => onEdit(task)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onEdit(task); }}>
								<Typography variant="subtitle1" sx={{ fontWeight: 750, textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "text.secondary" : "text.primary", overflowWrap: "anywhere" }}>{task.title}</Typography>
								{task.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.25, whiteSpace: "pre-wrap", overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.description}</Typography>}
								<Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.8, mt: task.description ? 0 : 1 }}>
									<Chip size="small" label={task.priority} color={priorityColor(task.priority)} variant={task.priority === "low" ? "outlined" : "filled"} sx={{ textTransform: "capitalize", height: 24, fontWeight: 700 }} />
									<Chip size="small" label={statusLabel(task.status)} variant="outlined" sx={{ height: 24, borderColor: "divider" }} />
									<Typography variant="caption" color={task.dueDate && task.dueDate < dateKey(new Date()) && task.status !== "done" ? "error.main" : "text.secondary"} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}><CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />{dueLabel(task.dueDate)}</Typography>
								</Stack>
							</Box>
							<Stack direction="row" spacing={0.25}>
								<IconButton aria-label={`Edit ${task.title}`} size="small" onClick={() => onEdit(task)}><EditOutlinedIcon fontSize="small" /></IconButton>
								<IconButton aria-label={`Delete ${task.title}`} size="small" color="error" onClick={() => onDelete(task)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
							</Stack>
						</Stack>
					</CardContent>
				</Card>
			))}
		</Stack>
	);
};
