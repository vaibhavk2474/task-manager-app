import { Box, Button, Card, CardContent, Checkbox, Chip, IconButton, Skeleton, Stack, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Task, TaskInput, TaskView } from "../types/task";
import { isTaskOverdue, taskDueLabel } from "../utils/deadline";

interface TaskListProps {
	tasks: Task[];
	view: TaskView;
	isLoading: boolean;
	search: string;
	onCreate: () => void;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
	onUpdate: (taskId: string, data: Partial<TaskInput>) => Promise<unknown>;
	now: Date;
	emptyState?: { title: string; description: string };
	showCreateOnEmpty?: boolean;
}

const priorityColor = (priority: Task["priority"]): "default" | "warning" | "error" => priority === "high" ? "error" : priority === "medium" ? "warning" : "default";
const statusLabel = (status: Task["status"]) => status === "in_progress" ? "In progress" : status === "done" ? "Completed" : "To do";

export const TaskList = ({ tasks, view, isLoading, search, onCreate, onEdit, onDelete, onUpdate, now, emptyState, showCreateOnEmpty = true }: TaskListProps) => {
	const emptyTitle = search ? "No matching tasks" : view === "completed" ? "Nothing completed yet" : view === "overdue" ? "You are all caught up" : view === "today" ? "Nothing due today" : view === "upcoming" ? "Nothing scheduled ahead" : "A clear space to begin";
	const emptyDescription = search ? "Try another search or clear the search field." : view === "completed" ? "Tasks you complete will appear here." : view === "overdue" ? "There are no overdue tasks right now." : view === "today" ? "Tasks with a deadline today will show up here." : view === "upcoming" ? "Add a due date to a task to see it here." : "Add a task and give your day a little direction.";
	if (isLoading && tasks.length === 0) return (
		<Stack component="ul" aria-label="Loading tasks" role="status" spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0 }}>
			{[0, 1, 2].map((item) => <Card key={item} component="li" variant="outlined" aria-hidden="true"><CardContent sx={{ p: "18px 20px !important" }}><Skeleton width="45%" /><Skeleton width="75%" /><Skeleton width="30%" /></CardContent></Card>)}
		</Stack>
	);
	if (!tasks.length) {
		return (
			<Card component="section" aria-live="polite" aria-atomic="true" aria-labelledby={`${view}-empty-state-title`} variant="outlined" sx={{ borderStyle: "dashed", bgcolor: "transparent", textAlign: "center", py: 7, px: 2 }}>
				<CardContent>
					<Box sx={{ width: 58, height: 58, mx: "auto", mb: 2, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: "action.hover", color: view === "overdue" ? "success.main" : "primary.main" }}>{view === "overdue" ? <CheckCircleOutlineRoundedIcon fontSize="large" /> : <AddRoundedIcon fontSize="large" />}</Box>
					<Typography id={`${view}-empty-state-title`} component="h2" variant="h6" gutterBottom sx={{ fontWeight: 800 }}>{emptyState?.title ?? emptyTitle}</Typography>
					<Typography color="text.secondary" sx={{ mb: 2.5 }}>{emptyState?.description ?? emptyDescription}</Typography>
					{showCreateOnEmpty && view !== "completed" && view !== "overdue" && !search && <Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreate}>{view === "all" ? "Create your first task" : "Create a task"}</Button>}
				</CardContent>
			</Card>
		);
	}

	return (
		<Stack component="ul" aria-label="Tasks" aria-busy={isLoading} spacing={1.25} sx={{ listStyle: "none", m: 0, p: 0, opacity: isLoading ? 0.6 : 1, transition: "opacity 160ms ease" }}>
			{isLoading && <Box component="li" role="status" sx={{ position: "absolute", width: "1px", height: "1px", p: 0, m: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>Updating tasks</Box>}
			{tasks.map((task) => (
				<Card key={task.id} component="li" variant="outlined" sx={{ borderColor: "divider", transition: "transform 140ms ease, box-shadow 140ms ease", "&:hover": { transform: "translateY(-1px)", boxShadow: 2 } }}>
					<CardContent sx={{ p: "18px 20px !important" }}>
						<Stack direction="row" spacing={1.25} sx={{ alignItems: "flex-start" }}>
							<Checkbox checked={task.status === "done"} onChange={() => { void onUpdate(task.id, { status: task.status === "done" ? "todo" : "done" }); }} slotProps={{ input: { "aria-label": `${task.status === "done" ? "Reopen" : "Complete"} ${task.title}` } }} sx={{ mt: -0.5, ml: -1 }} />
							<Box sx={{ minWidth: 0, flex: 1 }}>
								<Button onClick={() => onEdit(task)} color="inherit" aria-label={`Edit ${task.title}`} sx={{ display: "block", minWidth: 0, p: 0, textAlign: "left", textTransform: "none", fontWeight: 750, whiteSpace: "normal", overflowWrap: "anywhere", textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "text.secondary" : "text.primary" }}>{task.title}</Button>
								{task.description && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 1.25, whiteSpace: "pre-wrap", overflowWrap: "anywhere", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{task.description}</Typography>}
								<Stack direction="row" sx={{ alignItems: "center", flexWrap: "wrap", gap: 0.8, mt: task.description ? 0 : 1 }}>
									<Chip size="small" label={task.priority} color={priorityColor(task.priority)} variant={task.priority === "low" ? "outlined" : "filled"} sx={{ textTransform: "capitalize", height: 24, fontWeight: 700 }} />
									<Chip size="small" label={statusLabel(task.status)} variant="outlined" sx={{ height: 24, borderColor: "divider" }} />
									<Typography variant="caption" color={isTaskOverdue(task, now) ? "error.main" : "text.secondary"} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}><CalendarTodayRoundedIcon sx={{ fontSize: 14 }} />{taskDueLabel(task, now)}</Typography>
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
