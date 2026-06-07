import type { JobPost } from "../models/JobPost";
import type { ApplyType } from "../types/enums";

export const applicationQueue = {
	async add(data: { job: JobPost; config: ApplyType }) {
		console.log(`[KÖ] La till jobb i kön: ${data.job.jobTitle}`);
	},
};
// I might be able to replace this with some langgraph implementatiton.