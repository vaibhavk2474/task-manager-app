export const designTokens = {
	color: {
		brand: "#27695d",
		brandDeep: "#194b43",
		accent: "#d8ed78",
		canvas: "#f4f7f3",
		sectionLight: "#EAF1ED",
		sectionDark: "#151E1B",
		ink: "#1c2825",
		muted: "#73807b",
		border: "#e6ebe6",
		success: "#2c876b",
		warning: "#b8782e",
		danger: "#c55f55",
	},
	typography: {
		body: '"DM Sans", sans-serif',
		display: '"Manrope", "DM Sans", sans-serif',
	},
	radius: {
		control: 12,
		card: 20,
		shell: 24,
	},
	layout: {
		sidebarWidth: 256,
		headerHeight: 76,
		contentMaxWidth: 1240,
	},
} as const;

export type ThemeMode = "light" | "dark";
