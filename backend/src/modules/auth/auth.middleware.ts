import type { RequestHandler } from "express";
import { env } from "../../config/env.js";

export const requireAuth: RequestHandler = (request, response, next) => {
	if (!request.session.userId) {
		response.status(401).json({ message: "Sign in to continue." });
		return;
	}
	next();
};

export const requireSameOrigin: RequestHandler = (request, response, next) => {
	if (request.get("origin") !== env.appOrigin) {
		response.status(403).json({ message: "This request origin is not allowed." });
		return;
	}
	next();
};
