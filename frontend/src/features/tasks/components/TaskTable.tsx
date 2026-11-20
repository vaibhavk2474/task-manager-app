import { Box, Button, Card, Checkbox, Chip, IconButton, LinearProgress, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import type { Task, TaskInput } from "../types/task";
import { isTaskOverdue, taskDueLabel } from "../utils/deadline";

interface TaskTableProps {
	tasks: Task[];
	isLoading: boolean;
	now: Date;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
	onUpdate: (taskId: string, data: Partial<TaskInput>) => Promise<unknown>;
}

const priorityColor = (priority: Task["priority"]): "default" | "warning" | "error" => priority === "high" ? "error" : priority === "medium" ? "warning" : "default";
const statusLabel = (status: Task["status"]) => status === "in_progress" ? "In progress" : status === "done" ? "Completed" : "To do";

export const TaskTable = ({ tasks, isLoading, now, onEdit, onDelete, onUpdate }: TaskTableProps) => (
	<Card variant="outlined" aria-busy={isLoading} sx={{ borderColor: "divider", overflow: "hidden", opacity: isLoading ? 0.6 : 1, transition: "opacity 160ms ease" }}>
		{isLoading && <LinearProgress aria-label="Updating tasks" />}
		{isLoading && <Typography role="status" sx={{ position: "absolute", width: "1px", height: "1px", p: 0, m: -1, overflow: "hidden", clip: "rect(0, 0, 0, 0)", whiteSpace: "nowrap", border: 0 }}>Updating tasks</Typography>}
		<TableContainer role="region" aria-label="Scrollable task table" tabIndex={0} sx={{ overflowX: "auto", "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: -2 } }}>
		<Table aria-label="Tasks" sx={{ minWidth: 720 }}>
			<TableHead>
				<TableRow>
					<TableCell sx={{ fontWeight: 750, minWidth: 300 }}>Task</TableCell>
					<TableCell sx={{ fontWeight: 750, whiteSpace: "nowrap" }}>Status</TableCell>
					<TableCell sx={{ fontWeight: 750, display: { xs: "none", sm: "table-cell" } }}>Priority</TableCell>
					<TableCell sx={{ fontWeight: 750, whiteSpace: "nowrap" }}>Due</TableCell>
					<TableCell align="right" sx={{ fontWeight: 750, width: 104 }}>Actions</TableCell>
				</TableRow>
			</TableHead>
			<TableBody>
				{tasks.map((task) => {
					const overdue = isTaskOverdue(task, now);
					return (
						<TableRow key={task.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
							<TableCell>
								<Stack direction="row" spacing={1} sx={{ alignItems: "center", minWidth: 0 }}>
									<Checkbox checked={task.status === "done"} onChange={() => { void onUpdate(task.id, { status: task.status === "done" ? "todo" : "done" }); }} slotProps={{ input: { "aria-label": `${task.status === "done" ? "Reopen" : "Complete"} ${task.title}` } }} />
									<Box sx={{ minWidth: 0 }}>
										<Button onClick={() => onEdit(task)} color="inherit" sx={{ display: "block", minWidth: 0, p: 0, textAlign: "left", textTransform: "none", fontWeight: 750, whiteSpace: "normal", overflowWrap: "anywhere", textDecoration: task.status === "done" ? "line-through" : "none", color: task.status === "done" ? "text.secondary" : "text.primary" }}>{task.title}</Button>
										{task.description && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.description}</Typography>}
									</Box>
								</Stack>
							</TableCell>
							<TableCell><Chip size="small" label={statusLabel(task.status)} variant="outlined" sx={{ whiteSpace: "nowrap" }} /></TableCell>
							<TableCell sx={{ display: { xs: "none", sm: "table-cell" } }}><Chip size="small" label={task.priority} color={priorityColor(task.priority)} variant={task.priority === "low" ? "outlined" : "filled"} sx={{ textTransform: "capitalize" }} /></TableCell>
							<TableCell><Typography variant="body2" color={overdue ? "error.main" : "text.secondary"} sx={{ whiteSpace: "nowrap" }}>{taskDueLabel(task, now)}</Typography></TableCell>
							<TableCell align="right"><Stack direction="row" spacing={0.25} sx={{ justifyContent: "flex-end" }}>
								<IconButton aria-label={`Edit ${task.title}`} size="small" onClick={() => onEdit(task)}><EditOutlinedIcon fontSize="small" /></IconButton>
								<IconButton aria-label={`Delete ${task.title}`} size="small" color="error" onClick={() => onDelete(task)}><DeleteOutlineRoundedIcon fontSize="small" /></IconButton>
							</Stack></TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
		</TableContainer>
	</Card>
);
