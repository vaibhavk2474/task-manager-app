import { useState, type ReactNode } from "react";
import { Avatar, Box, Button, Divider, Drawer, IconButton, InputAdornment, List, ListItemButton, ListItemIcon, ListItemText, TextField, Tooltip, Typography } from "@mui/material";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import CalendarTodayRoundedIcon from "@mui/icons-material/CalendarTodayRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import FormatListBulletedRoundedIcon from "@mui/icons-material/FormatListBulletedRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import { useAuth } from "../../features/auth/context/useAuth";
import type { TaskView } from "../../features/tasks/types/task";
import { designTokens } from "../../theme/tokens";
import { useThemeMode } from "../../theme/useThemeMode";

interface TaskShellProps {
	children: ReactNode;
	view: TaskView;
	onViewChange: (view: TaskView) => void;
	counts: { all: number; today: number; upcoming: number; completed: number };
	search: string;
	onSearchChange: (value: string) => void;
	onCreateTask: () => void;
}

const navItems = [
	{ key: "all", label: "All tasks", Icon: FormatListBulletedRoundedIcon },
	{ key: "today", label: "Today", Icon: CalendarTodayRoundedIcon },
	{ key: "upcoming", label: "Upcoming", Icon: TaskAltRoundedIcon },
	{ key: "completed", label: "Completed", Icon: CheckCircleRoundedIcon },
] as const;

export const TaskShell = ({ children, view, onViewChange, counts, search, onSearchChange, onCreateTask }: TaskShellProps) => {
	const { user, signOut } = useAuth();
	const { mode, toggleMode } = useThemeMode();
	const [mobileOpen, setMobileOpen] = useState(false);
	const handleSignOut = async () => { await signOut(); };

	const sidebar = (
		<Box sx={{ width: designTokens.layout.sidebarWidth, height: "100%", display: "flex", flexDirection: "column", bgcolor: "background.paper" }}>
			<Box sx={{ px: 2.5, pt: 3, pb: 2.5, display: "flex", alignItems: "center", gap: 1.25 }}>
				<Box sx={{ width: 36, height: 36, display: "grid", placeItems: "center", borderRadius: 2.5, bgcolor: "primary.main", color: "primary.contrastText" }}><CheckCircleRoundedIcon fontSize="small" /></Box>
				<Box><Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.1 }}>Daymark</Typography><Typography variant="caption" color="text.secondary">PERSONAL WORKSPACE</Typography></Box>
			</Box>
			<Box sx={{ px: 2, pb: 2 }}><Button fullWidth startIcon={<AddRoundedIcon />} variant="contained" onClick={onCreateTask}>New task</Button></Box>
			<Typography variant="overline" color="text.secondary" sx={{ px: 2.5, pb: 0.75, fontWeight: 700, letterSpacing: ".12em" }}>WORKSPACE</Typography>
			<List sx={{ px: 1.25, py: 0 }}>
				{navItems.map(({ key, label, Icon }) => (
					<ListItemButton key={key} selected={view === key} onClick={() => { onViewChange(key); setMobileOpen(false); }} sx={{ borderRadius: 2.5, mb: 0.5, minHeight: 46, "&.Mui-selected": { bgcolor: "action.selected", color: "primary.main" }, "&.Mui-selected:hover": { bgcolor: "action.selected" } }}>
						<ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><Icon fontSize="small" /></ListItemIcon>
						<ListItemText primary={label} sx={{ "& .MuiListItemText-primary": { fontSize: 14, fontWeight: view === key ? 700 : 550 } }} />
						<Typography variant="caption" color="text.secondary">{counts[key]}</Typography>
					</ListItemButton>
				))}
			</List>
			<Box sx={{ mt: "auto", p: 1.5 }}>
				<Divider sx={{ mb: 1.5 }} />
				<Box sx={{ display: "flex", alignItems: "center", gap: 1.2, p: 1 }}>
					<Avatar sx={{ width: 34, height: 34, bgcolor: "secondary.main", color: "text.primary", fontSize: 13, fontWeight: 800 }}>{user?.name.slice(0, 1).toUpperCase()}</Avatar>
					<Box sx={{ minWidth: 0, flex: 1 }}><Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{user?.name}</Typography><Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography></Box>
					<Tooltip title="Sign out"><IconButton size="small" onClick={handleSignOut} aria-label="Sign out"><LogoutRoundedIcon fontSize="small" /></IconButton></Tooltip>
				</Box>
				<Button fullWidth color="inherit" onClick={toggleMode} startIcon={mode === "light" ? <DarkModeRoundedIcon /> : <LightModeRoundedIcon />} sx={{ justifyContent: "flex-start", px: 1.5, color: "text.secondary" }}>{mode === "light" ? "Dark appearance" : "Light appearance"}</Button>
			</Box>
		</Box>
	);

	return (
		<Box sx={{ minHeight: "100vh", display: "flex", bgcolor: "background.default" }}>
			<Box sx={{ width: designTokens.layout.sidebarWidth, flexShrink: 0, borderRight: 1, borderColor: "divider", display: { xs: "none", md: "block" } }}>{sidebar}</Box>
			<Drawer open={mobileOpen} onClose={() => setMobileOpen(false)} sx={{ display: { xs: "block", md: "none" }, "& .MuiDrawer-paper": { border: 0 } }}>{sidebar}</Drawer>
			<Box component="main" sx={{ minWidth: 0, flex: 1 }}>
				<Box component="header" sx={{ height: designTokens.layout.headerHeight, px: { xs: 2, md: 4 }, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider", position: "sticky", top: 0, zIndex: 5 }}>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
						<IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" } }} aria-label="Open navigation"><MenuRoundedIcon /></IconButton>
						<Typography variant="body2" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>Workspace <Box component="span" sx={{ mx: 1, color: "divider" }}>/</Box></Typography>
						<Typography variant="body2" sx={{ fontWeight: 700 }}>{navItems.find((item) => item.key === view)?.label}</Typography>
					</Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
						<TextField size="small" placeholder="Search tasks" value={search} onChange={(event) => onSearchChange(event.target.value)} sx={{ width: { xs: 150, sm: 230 }, "& .MuiOutlinedInput-root": { bgcolor: "background.default" } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchRoundedIcon fontSize="small" color="action" /></InputAdornment> } }} />
						<Button variant="contained" startIcon={<AddRoundedIcon />} onClick={onCreateTask} sx={{ display: { xs: "none", sm: "inline-flex" } }}>New task</Button>
					</Box>
				</Box>
				<Box sx={{ px: { xs: 2, sm: 3, lg: 5 }, py: { xs: 3, md: 5 } }}>{children}</Box>
			</Box>
		</Box>
	);
};
