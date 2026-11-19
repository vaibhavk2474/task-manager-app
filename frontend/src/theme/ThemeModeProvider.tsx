import { useMemo, useState, type ReactNode } from "react";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createAppTheme } from "./theme";
import type { ThemeMode } from "./tokens";
import { ThemeModeContext } from "./ThemeModeContext";

export const ThemeModeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<ThemeMode>("light");
	const theme = useMemo(() => createAppTheme(mode), [mode]);
	const value = useMemo(() => ({ mode, toggleMode: () => setMode((current) => current === "light" ? "dark" : "light") }), [mode]);

	return (
		<ThemeModeContext.Provider value={value}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				{children}
			</ThemeProvider>
		</ThemeModeContext.Provider>
	);
};
