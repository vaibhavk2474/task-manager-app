import { createContext } from "react";
import type { User } from "../types/auth";

export interface AuthContextValue {
	user: User | null;
	isLoading: boolean;
	signIn: (email: string, password: string) => Promise<void>;
	signUp: (name: string, email: string, password: string) => Promise<void>;
	signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
