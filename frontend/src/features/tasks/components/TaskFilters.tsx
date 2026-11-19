import { Box, Button, Stack } from "@mui/material";
import type { TaskListResponse, TaskView } from "../types/task";

interface TaskFiltersProps {
	view: TaskView;
	counts: TaskListResponse["counts"];
	onChange: (view: TaskView) => void;
}

const filters: { view: TaskView; label: string; count: keyof TaskListResponse["counts"] }[] = [
	{ view: "all", label: "All tasks", count: "all" },
	{ view: "today", label: "Today", count: "today" },
	{ view: "upcoming", label: "Upcoming", count: "upcoming" },
	{ view: "overdue", label: "Overdue", count: "overdue" },
	{ view: "completed", label: "Completed", count: "completed" },
];

export const TaskFilters = ({ view, counts, onChange }: TaskFiltersProps) => (
	<Stack direction="row" role="group" aria-label="Filter tasks" sx={{ minWidth: 0, flexWrap: "wrap", justifyContent: { xs: "flex-start", lg: "flex-end" }, gap: 0.75 }}>
		{filters.map((filter) => {
			const selected = view === filter.view;
			return (
				<Button
					key={filter.view}
					aria-pressed={selected}
					variant={selected ? "contained" : "outlined"}
					color={filter.view === "overdue" && counts.overdue > 0 && !selected ? "error" : "primary"}
					size="small"
					onClick={() => onChange(filter.view)}
					sx={{ minHeight: 36, px: { xs: 1.1, sm: 1.5 }, borderRadius: 99, whiteSpace: "nowrap" }}
				>
					{filter.label}<Box component="span" sx={{ ml: 0.75, opacity: selected ? 0.8 : 0.65, fontVariantNumeric: "tabular-nums" }}>{counts[filter.count]}</Box>
				</Button>
			);
		})}
	</Stack>
);
