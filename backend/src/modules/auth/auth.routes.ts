import { Router } from "express";
import rateLimit from "express-rate-limit";
import { currentUser, login, logout, register } from "./auth.controller.js";
import { requireAuth, requireSameOrigin } from "./auth.middleware.js";
import { signInSchema, signUpSchema } from "./auth.schemas.js";

const router = Router();
const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false });

const validate = (schema: typeof signInSchema | typeof signUpSchema): import("express").RequestHandler => (request, response, next) => {
	const result = schema.safeParse(request.body);
	if (!result.success) {
		response.status(400).json({ message: result.error.issues[0]?.message ?? "Check the submitted information." });
		return;
	}
	request.body = result.data;
	next();
};

router.post("/register", requireSameOrigin, authLimit, validate(signUpSchema), register);
router.post("/login", requireSameOrigin, authLimit, validate(signInSchema), login);
router.get("/me", requireAuth, currentUser);
router.post("/logout", requireSameOrigin, logout);

export default router;
