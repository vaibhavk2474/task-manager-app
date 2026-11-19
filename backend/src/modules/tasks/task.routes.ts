import { Router } from "express";
import { requireAuth, requireSameOrigin } from "../auth/auth.middleware.js";
import { createTask, deleteTask, listTasks, updateTask } from "./task.controller.js";
import { createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema } from "./task.schemas.js";

const router = Router();
router.use(requireAuth);

const validateBody = (schema: typeof createTaskSchema | typeof updateTaskSchema): import("express").RequestHandler => (request, response, next) => {
	const result = schema.safeParse(request.body);
	if (!result.success) {
		response.status(400).json({ message: result.error.issues[0]?.message ?? "Check the task details." });
		return;
	}
	request.body = result.data;
	next();
};

router.get("/", (request, response, next) => {
	const result = listTasksSchema.safeParse(request.query);
	if (!result.success) { response.status(400).json({ message: "Invalid task filters." }); return; }
	response.locals.taskFilters = result.data;
	next();
}, listTasks);
router.post("/", requireSameOrigin, validateBody(createTaskSchema), createTask);
router.patch("/:id", requireSameOrigin, (request, response, next) => {
	const id = taskIdSchema.safeParse(request.params.id);
	if (!id.success) { response.status(404).json({ message: "Task not found." }); return; }
	next();
}, validateBody(updateTaskSchema), updateTask);
router.delete("/:id", requireSameOrigin, (request, response, next) => {
	const id = taskIdSchema.safeParse(request.params.id);
	if (!id.success) { response.status(404).json({ message: "Task not found." }); return; }
	next();
}, deleteTask);

export default router;
