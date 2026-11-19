import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	PORT: z.coerce.number().int().min(1).max(65535).default(3002),
	MONGODB_URI: z.string().min(1, "MONGODB_URI is required."),
	SESSION_SECRET: z.string().min(32, "SESSION_SECRET must contain at least 32 characters."),
	APP_ORIGIN: z.string().url().default("http://localhost:5175"),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
	const problems = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n");
	throw new Error(`Invalid environment configuration:\n${problems}`);
}

if (parsed.data.MONGODB_URI.includes("<db-user>") || parsed.data.MONGODB_URI.includes("<cluster-host>")) {
	throw new Error("Replace the Atlas placeholders in MONGODB_URI in backend/.env.");
}

export const env = {
	nodeEnv: parsed.data.NODE_ENV,
	port: parsed.data.PORT,
	mongoUri: parsed.data.MONGODB_URI,
	sessionSecret: parsed.data.SESSION_SECRET,
	appOrigin: new URL(parsed.data.APP_ORIGIN).origin,
	isProduction: parsed.data.NODE_ENV === "production",
};
