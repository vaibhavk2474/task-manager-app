import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import type { TaskSort } from "../types/task";

interface TaskSortSelectProps {
	value: TaskSort;
	onChange: (sort: TaskSort) => void;
}

const sortOptions: { value: TaskSort; label: string }[] = [
	{ value: "due_soon", label: "Due date · soonest first" },
	{ value: "due_late", label: "Due date · latest first" },
	{ value: "priority_high", label: "Priority · high to low" },
	{ value: "priority_low", label: "Priority · low to high" },
	{ value: "updated_newest", label: "Recently updated" },
	{ value: "updated_oldest", label: "Oldest updated" },
	{ value: "title_asc", label: "Title · A to Z" },
	{ value: "title_desc", label: "Title · Z to A" },
];

export const TaskSortSelect = ({ value, onChange }: TaskSortSelectProps) => (
	<FormControl size="small" sx={{ width: { xs: "100%", md: 220 }, flexShrink: 0 }}>
		<InputLabel id="task-sort-label">Sort by</InputLabel>
		<Select
			labelId="task-sort-label"
			id="task-sort"
			value={value}
			label="Sort by"
			onChange={(event) => onChange(event.target.value as TaskSort)}
		>
			{sortOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
		</Select>
	</FormControl>
);
