import { model, Schema, type Types } from "mongoose";

export interface User {
	_id?: Types.ObjectId;
	email: string;
	createdAt: Date;
}

const userSchema = new Schema<User>({
	email: { type: String, required: true, unique: true },
	createdAt: { type: Date, default: Date.now },
});

export const UserModel = model<User>("User", userSchema);
