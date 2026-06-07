import { model, Schema } from "mongoose";

export interface JobPost {
	id: string;
	headline: string;
	jobDescription: string;
	removed?: boolean;
}

const jobPostSchema = new Schema<JobPost>({
	id: { type: String, required: true, unique: true },
	headline: { type: String, required: true },
	jobDescription: { type: String, required: true },
});

export const JobPostModel = model<JobPost>("JobPost", jobPostSchema);
