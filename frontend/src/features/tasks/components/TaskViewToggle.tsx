import { ToggleButton, ToggleButtonGroup } from "@mui/material";
import ViewAgendaOutlinedIcon from "@mui/icons-material/ViewAgendaOutlined";
import TableRowsOutlinedIcon from "@mui/icons-material/TableRowsOutlined";

export type TaskDisplayMode = "cards" | "table";

interface TaskViewToggleProps {
	value: TaskDisplayMode;
	onChange: (value: TaskDisplayMode) => void;
}

export const TaskViewToggle = ({ value, onChange }: TaskViewToggleProps) => (
	<ToggleButtonGroup
		value={value}
		exclusive
		size="small"
		aria-label="Task display mode"
		onChange={(_event, nextValue: TaskDisplayMode | null) => { if (nextValue) onChange(nextValue); }}
		sx={{ flexShrink: 0, "& .MuiToggleButton-root": { px: 1.25, gap: 0.75, textTransform: "none", whiteSpace: "nowrap" } }}
	>
		<ToggleButton value="cards" aria-label="Show tasks as cards"><ViewAgendaOutlinedIcon fontSize="small" />Cards</ToggleButton>
		<ToggleButton value="table" aria-label="Show tasks as a table"><TableRowsOutlinedIcon fontSize="small" />Table</ToggleButton>
	</ToggleButtonGroup>
);
