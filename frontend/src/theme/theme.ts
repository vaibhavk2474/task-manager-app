import { createTheme, type PaletteMode } from "@mui/material/styles";
import { designTokens } from "./tokens";

export const createAppTheme = (mode: PaletteMode) => createTheme({
	palette: {
		mode,
		primary: { main: designTokens.color.brand, dark: designTokens.color.brandDeep, contrastText: "#ffffff" },
		secondary: { main: designTokens.color.accent, contrastText: designTokens.color.ink },
		success: { main: designTokens.color.success },
		warning: { main: designTokens.color.warning },
		error: { main: designTokens.color.danger },
		background: mode === "light"
			? { default: designTokens.color.canvas, paper: "#ffffff" }
			: { default: "#111917", paper: "#19221f" },
		text: mode === "light"
			? { primary: designTokens.color.ink, secondary: designTokens.color.muted }
			: { primary: "#edf3ef", secondary: "#a2b0a9" },
		divider: mode === "light" ? designTokens.color.border : "#2a3732",
	},
	typography: {
		fontFamily: designTokens.typography.body,
		h1: { fontFamily: designTokens.typography.display, fontWeight: 800, letterSpacing: "-0.045em" },
		h2: { fontFamily: designTokens.typography.display, fontWeight: 800, letterSpacing: "-0.04em" },
		h3: { fontFamily: designTokens.typography.display, fontWeight: 800, letterSpacing: "-0.035em" },
		h4: { fontFamily: designTokens.typography.display, fontWeight: 700, letterSpacing: "-0.03em" },
		button: { textTransform: "none", fontWeight: 700 },
	},
	shape: { borderRadius: designTokens.radius.control },
	components: {
		MuiCssBaseline: {
			styleOverrides: {
				"*": { boxSizing: "border-box" },
				body: { minWidth: 320, minHeight: "100vh" },
				"::selection": { backgroundColor: designTokens.color.accent, color: designTokens.color.ink },
			},
		},
		MuiButton: {
			defaultProps: { disableElevation: true },
			styleOverrides: { root: { minHeight: 44, borderRadius: designTokens.radius.control, paddingInline: 18 } },
		},
		MuiCard: { styleOverrides: { root: { borderRadius: designTokens.radius.card } } },
		MuiPaper: { styleOverrides: { rounded: { borderRadius: designTokens.radius.card } } },
		MuiOutlinedInput: {
			styleOverrides: { root: { borderRadius: designTokens.radius.control } },
		},
	},
});
