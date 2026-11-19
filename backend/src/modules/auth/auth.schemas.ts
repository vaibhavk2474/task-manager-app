import { z } from "zod";

export const signUpSchema = z.object({
	name: z.string().trim().min(1, "Name is required.").max(80),
	email: z.email().trim().toLowerCase().max(254),
	password: z.string().min(8, "Password must contain at least 8 characters.").max(72, "Password must be 72 characters or fewer."),
}).strict();

export const signInSchema = z.object({
	email: z.email().trim().toLowerCase().max(254),
	password: z.string().min(1).max(72),
}).strict();
