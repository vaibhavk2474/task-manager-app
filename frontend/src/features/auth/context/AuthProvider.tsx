import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { ApiError } from "../../../shared/api/client";
import { authApi } from "../api/authApi";
import { AuthContext } from "./authContext";
import type { User } from "../types/auth";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		let active = true;
		authApi.me()
			.then(({ user: currentUser }) => { if (active) setUser(currentUser); })
			.catch((error: unknown) => {
				if (active && !(error instanceof ApiError && error.status === 401)) console.error("Could not restore the session.", error);
			})
			.finally(() => { if (active) setIsLoading(false); });
		return () => { active = false; };
	}, []);

	const signIn = useCallback(async (email: string, password: string) => {
		const response = await authApi.login({ email, password });
		setUser(response.user);
	}, []);

	const signUp = useCallback(async (name: string, email: string, password: string) => {
		const response = await authApi.register({ name, email, password });
		setUser(response.user);
	}, []);

	const signOut = useCallback(async () => {
		await authApi.logout();
		setUser(null);
	}, []);

	const value = useMemo(() => ({ user, isLoading, signIn, signUp, signOut }), [user, isLoading, signIn, signUp, signOut]);
	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
