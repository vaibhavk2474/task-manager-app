import { apiRequest } from "../../../shared/api/client";
import type { Credentials, Registration, User } from "../types/auth";

interface UserResponse { user: User }

export const authApi = {
	me: () => apiRequest<UserResponse>("/api/auth/me"),
	register: (data: Registration) => apiRequest<UserResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
	login: (data: Credentials) => apiRequest<UserResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(data) }),
	logout: () => apiRequest<void>("/api/auth/logout", { method: "POST" }),
};
