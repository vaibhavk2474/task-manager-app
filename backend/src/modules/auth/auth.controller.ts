import type { RequestHandler } from "express";
import { env } from "../../config/env.js";
import { authService, AuthServiceError } from "./auth.service.js";

const sessionCookieOptions = { httpOnly: true, sameSite: "lax" as const, secure: env.isProduction, path: "/" };

const publicUser = (user: { id: string; name: string; email: string }) => ({ id: user.id, name: user.name, email: user.email });

const regenerateSession = (request: Parameters<RequestHandler>[0]) => new Promise<void>((resolve, reject) => {
	request.session.regenerate((error) => error ? reject(error) : resolve());
});

const saveSession = (request: Parameters<RequestHandler>[0]) => new Promise<void>((resolve, reject) => {
	request.session.save((error) => error ? reject(error) : resolve());
});

const handleAuthError = (error: unknown, response: Parameters<RequestHandler>[1]) => {
	if (error instanceof AuthServiceError) {
		response.status(error.status).json({ message: error.message });
		return true;
	}
	return false;
};

export const register: RequestHandler = async (request, response, next) => {
	try {
		const user = await authService.register(request.body as { name: string; email: string; password: string });
		await regenerateSession(request);
		request.session.userId = user.id;
		await saveSession(request);
		response.status(201).json({ user: publicUser(user) });
	} catch (error) {
		if (!handleAuthError(error, response)) next(error);
	}
};

export const login: RequestHandler = async (request, response, next) => {
	try {
		const user = await authService.authenticate(request.body.email as string, request.body.password as string);
		await regenerateSession(request);
		request.session.userId = user.id;
		await saveSession(request);
		response.json({ user: publicUser(user) });
	} catch (error) {
		if (!handleAuthError(error, response)) next(error);
	}
};

export const currentUser: RequestHandler = async (request, response, next) => {
	try {
		const userId = request.session.userId;
		if (!userId) { response.status(401).json({ message: "Sign in to continue." }); return; }
		const user = await authService.findById(userId);
		if (!user) {
			request.session.destroy(() => undefined);
			response.clearCookie("taskmanagerapp.sid", sessionCookieOptions);
			response.status(401).json({ message: "Your session has expired. Sign in again." });
			return;
		}
		response.json({ user: publicUser(user) });
	} catch (error) { next(error); }
};

export const logout: RequestHandler = (request, response, next) => {
	request.session.destroy((error) => {
		if (error) { next(error); return; }
		response.clearCookie("taskmanagerapp.sid", sessionCookieOptions);
		response.status(204).end();
	});
};
