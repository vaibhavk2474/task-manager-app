import type { ReactNode } from "react";
import { Box, Button, Card, CardActionArea, CardContent, LinearProgress, Skeleton, Stack, Typography } from "@mui/material";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EventBusyOutlinedIcon from "@mui/icons-material/EventBusyOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { TaskList } from "./TaskList";
import type { Task, TaskInput, TaskPageView, TaskListResponse } from "../types/task";

interface OverviewDashboardProps {
	previews: NonNullable<TaskListResponse["previews"]>;
	counts: { all: number; today: number; upcoming: number; overdue: number; completed: number };
	isLoading: boolean;
	now: Date;
	onViewChange: (view: TaskPageView) => void;
	onCreate: () => void;
	onEdit: (task: Task) => void;
	onDelete: (task: Task) => void;
	onUpdate: (taskId: string, data: Partial<TaskInput>) => Promise<unknown>;
}

export const OverviewDashboard = ({ previews, counts, isLoading, now, onViewChange, onCreate, onEdit, onDelete, onUpdate }: OverviewDashboardProps) => {
	const { today: todayTasks, upcoming: upcomingTasks, overdue: overdueTasks } = previews;
	const openCount = counts.all - counts.completed;
	const completionRate = counts.all ? Math.round((counts.completed / counts.all) * 100) : 0;

	return (
		<Stack spacing={3} sx={{ maxWidth: 1120, mx: "auto" }}>
			<Stack direction={{ xs: "column", sm: "row" }} sx={{ alignItems: { xs: "flex-start", sm: "flex-end" }, justifyContent: "space-between", gap: 2 }}>
				<Box>
					<Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: ".13em" }}>{now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}</Typography>
					<Typography variant="h3" component="h1" sx={{ mt: 0.4, fontSize: { xs: 32, sm: 40 } }}>Your day at a glance</Typography>
					<Typography color="text.secondary" sx={{ mt: 0.7 }}>A clear view of what needs attention and what is coming next.</Typography>
				</Box>
				<Typography variant="body2" color="text.secondary" sx={{ flexShrink: 0, bgcolor: "background.paper", border: 1, borderColor: "divider", borderRadius: 99, px: 1.5, py: 0.8 }}>
					{openCount} open {openCount === 1 ? "task" : "tasks"}
				</Typography>
			</Stack>

			<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", xl: "repeat(4, 1fr)" }, gap: 1.5 }}>
				<SummaryCard isLoading={isLoading} label="Due today" value={String(counts.today)} note="Plan your next steps" icon={<EventAvailableOutlinedIcon />} onClick={() => onViewChange("today")} />
				<SummaryCard isLoading={isLoading} label="Upcoming" value={String(counts.upcoming)} note="Tasks scheduled ahead" icon={<EventNoteOutlinedIcon />} onClick={() => onViewChange("upcoming")} />
				<SummaryCard isLoading={isLoading} label="Overdue" value={String(counts.overdue)} note={counts.overdue ? "Review what needs attention" : "You are all caught up"} icon={<EventBusyOutlinedIcon />} alert={counts.overdue > 0} onClick={() => onViewChange("overdue")} />
				<SummaryCard isLoading={isLoading} label="Completed" value={`${completionRate}%`} note={`${counts.completed} of ${counts.all} tasks`} icon={<InsightsRoundedIcon />} onClick={() => onViewChange("completed")} />
			</Box>

			<Card variant="outlined" sx={{ borderColor: "divider" }}>
				<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
					<Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1.25 }}>
						<Box><Typography variant="subtitle1" sx={{ fontWeight: 750 }}>Your progress</Typography><Typography variant="body2" color="text.secondary">{isLoading ? <Skeleton width={150} /> : `${counts.completed} completed · ${openCount} still open`}</Typography></Box>
						<Typography variant="h5" sx={{ color: "primary.main", fontWeight: 800 }}>{isLoading ? <Skeleton width={56} /> : `${completionRate}%`}</Typography>
					</Stack>
					<LinearProgress variant={isLoading ? "indeterminate" : "determinate"} value={completionRate} sx={{ height: 8, borderRadius: 99, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 99 } }} aria-label={isLoading ? "Loading task completion progress" : `Task completion progress: ${completionRate}%`} aria-busy={isLoading} />
				</CardContent>
			</Card>

			<Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
				<TaskSection title="Today's focus" count={todayTasks.length} onViewAll={() => onViewChange("today")}>
					<TaskList tasks={todayTasks.slice(0, 4)} view="today" isLoading={isLoading} search="" now={now} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate} showCreateOnEmpty={false} emptyState={{ title: "Nothing due today", description: "Tasks with a deadline today will show up here." }} />
				</TaskSection>
				<TaskSection title="Coming up" count={upcomingTasks.length} onViewAll={() => onViewChange("upcoming")}>
					<TaskList tasks={upcomingTasks.slice(0, 4)} view="upcoming" isLoading={isLoading} search="" now={now} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate} showCreateOnEmpty={false} emptyState={{ title: "Nothing scheduled ahead", description: "Add a due date to a task to see it here." }} />
				</TaskSection>
				{overdueTasks.length > 0 && (
					<Box sx={{ gridColumn: { lg: "1 / -1" } }}>
						<TaskSection title="Needs attention" count={overdueTasks.length} onViewAll={() => onViewChange("overdue")}>
							<TaskList tasks={overdueTasks.slice(0, 4)} view="overdue" isLoading={isLoading} search="" now={now} onCreate={onCreate} onEdit={onEdit} onDelete={onDelete} onUpdate={onUpdate} showCreateOnEmpty={false} />
						</TaskSection>
					</Box>
				)}
			</Box>
		</Stack>
	);
};

const TaskSection = ({ title, count, onViewAll, children }: { title: string; count: number; onViewAll: () => void; children: ReactNode }) => (
	<Stack spacing={1.5} sx={{ minWidth: 0 }}>
		<Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", gap: 1 }}>
			<Box><Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography><Typography variant="body2" color="text.secondary">{count} {count === 1 ? "task" : "tasks"}</Typography></Box>
			<Button size="small" endIcon={<ArrowForwardRoundedIcon />} onClick={onViewAll}>View all</Button>
		</Stack>
		{children}
	</Stack>
);

const SummaryCard = ({ label, value, note, icon, alert = false, isLoading, onClick }: { label: string; value: string; note: string; icon: ReactNode; alert?: boolean; isLoading: boolean; onClick: () => void }) => (
	<Card variant="outlined" sx={{ borderColor: "divider", height: "100%", minHeight: 116 }}>
		<CardActionArea onClick={onClick} disabled={isLoading} sx={{ height: "100%" }}>
			<CardContent sx={{ p: "18px 20px !important" }}>
				<Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between", gap: 1 }}>
					<Box><Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>{label}</Typography><Typography variant="h4" sx={{ mt: 0.8, color: alert ? "error.main" : "text.primary" }}>{isLoading ? <Skeleton width={60} /> : value}</Typography><Typography variant="caption" color="text.secondary">{isLoading ? <Skeleton width={120} /> : note}</Typography></Box>
					<Box sx={{ width: 40, height: 40, flexShrink: 0, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: alert ? "error.main" : "action.hover", color: alert ? "error.contrastText" : "primary.main" }}>{icon}</Box>
				</Stack>
			</CardContent>
		</CardActionArea>
	</Card>
);
