import { model, Schema, type Types } from "mongoose";

export interface Application {
	_id?: Types.ObjectId;
	userId: Types.ObjectId;
	profileId: Types.ObjectId;
	jobPostId: number;
	generatedCvText: string;
	status: string;
}

const applicationSchema = new Schema<Application>({
	userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
	profileId: { type: Schema.Types.ObjectId, ref: "Profile", required: true },
	jobPostId: { type: Number, required: true },
	generatedCvText: { type: String, default: "" },
	status: {
		type: String,
		required: true,
		enum: ["Queue", "Sent", "Rejected", "Skipped"],
	},
});

applicationSchema.index({ userId: 1, jobPostId: 1 }, { unique: true });

export const ApplicationModel = model<Application>(
	"Application",
	applicationSchema,
);
