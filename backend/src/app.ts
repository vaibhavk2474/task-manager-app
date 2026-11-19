import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import helmet from "helmet";
import { env } from "./config/env.js";
import { requireSameOrigin } from "./modules/auth/auth.middleware.js";
import authRouter from "./modules/auth/auth.routes.js";
import tasksRouter from "./modules/tasks/task.routes.js";

const app = express();
if (env.isProduction) app.set("trust proxy", 1);

app.use(helmet({ strictTransportSecurity: env.isProduction ? undefined : false }));
app.use(express.json({ limit: "32kb" }));
app.use(session({
	name: "taskmanagerapp.sid",
	secret: env.sessionSecret,
	store: MongoStore.create({ mongoUrl: env.mongoUri, collectionName: "task_manager_sessions", ttl: 7 * 24 * 60 * 60 }),
	resave: false,
	saveUninitialized: false,
	rolling: true,
	cookie: { httpOnly: true, secure: env.isProduction, sameSite: "lax", path: "/", maxAge: 7 * 24 * 60 * 60 * 1000 },
}));

app.get("/api/health", (_request, response) => response.json({ status: "ok", service: "task-manager-app-api" }));
app.use("/api/auth", authRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api", requireSameOrigin, (_request, response) => response.status(404).json({ message: "API route not found." }));
app.use((_request, response) => response.status(404).json({ message: "Route not found." }));

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
	void _next;
	console.error("Unhandled API error:", error);
	response.status(500).json({ message: "Something went wrong. Please try again." });
};
app.use(errorHandler);

export default app;
