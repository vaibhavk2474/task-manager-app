import bcrypt from "bcryptjs";
import { UserModel } from "./user.model.js";

export class AuthServiceError extends Error {
	constructor(message: string, public readonly status: number) {
		super(message);
		this.name = "AuthServiceError";
	}
}

export const authService = {
	async register(input: { name: string; email: string; password: string }) {
		const existing = await UserModel.exists({ email: input.email });
		if (existing) throw new AuthServiceError("An account with this email already exists.", 409);
		const passwordHash = await bcrypt.hash(input.password, 12);
		try {
			return await UserModel.create({ name: input.name, email: input.email, passwordHash });
		} catch (error) {
			if (error && typeof error === "object" && "code" in error && error.code === 11000) {
				throw new AuthServiceError("An account with this email already exists.", 409);
			}
			throw error;
		}
	},
	async authenticate(email: string, password: string) {
		const user = await UserModel.findOne({ email });
		if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
			throw new AuthServiceError("Email or password is incorrect.", 401);
		}
		return user;
	},
	async findById(id: string) {
		return UserModel.findById(id);
	},
};
