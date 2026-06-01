import type { JobPost } from "../models/JobPost";

export const applicationQueue = {
	async add(data: { job: JobPost; config: any }) {
		console.log(`[KÖ] La till jobb i kön: ${data.job.jobTitle}`);
	},
};
