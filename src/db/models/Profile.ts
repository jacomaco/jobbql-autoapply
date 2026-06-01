import { model, Schema, type Types } from "mongoose";

export interface Profile {
	_id?: Types.ObjectId;
	userId: Types.ObjectId;
	profileName: string;
	baseCvText: string;
}

const profileSchema = new Schema<Profile>({
	userId: {
		type: Schema.Types.ObjectId,
		ref: "User",
		required: true,
	},
	profileName: { type: String, required: true },
	baseCvText: { type: String, required: true },
});

export const ProfileModel = model<Profile>("Profile", profileSchema);
