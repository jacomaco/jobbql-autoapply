import { model, Schema } from "mongoose";

export interface JobPost {
	id: number;
	jobTitle: string;
	jobDescription: string;
}

const jobPostSchema = new Schema<JobPost>({
	id: { type: Number, required: true, unique: true },
	jobTitle: { type: String, required: true },
	jobDescription: { type: String, required: true },
});

export const JobPostModel = model<JobPost>("JobPost", jobPostSchema);
