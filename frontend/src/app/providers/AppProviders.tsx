import type { ReactNode } from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeModeProvider } from "../../theme/ThemeModeProvider";
import { AuthProvider } from "../../features/auth/context/AuthProvider";

export const AppProviders = ({ children }: { children: ReactNode }) => (
	<ThemeModeProvider>
		<BrowserRouter>
			<AuthProvider>{children}</AuthProvider>
		</BrowserRouter>
	</ThemeModeProvider>
);
