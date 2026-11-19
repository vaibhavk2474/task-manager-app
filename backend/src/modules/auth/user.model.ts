import { Schema, model, type InferSchemaType } from "mongoose";

const userSchema = new Schema({
	name: { type: String, required: true, trim: true, maxlength: 80 },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
	passwordHash: { type: String, required: true },
}, { timestamps: true });

export type UserRecord = InferSchemaType<typeof userSchema>;
export const UserModel = model("User", userSchema);
