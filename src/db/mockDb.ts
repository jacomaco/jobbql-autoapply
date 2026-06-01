import type { Application } from "../types";

export const db = {
	application: {
		async exists(userId: number, jobPostId: number): Promise<boolean> {
			return false;
		},
		async create(data: Omit<Application, "id">): Promise<void> {
			console.log(
				`[DB] Sparade applikation för jobb ${data.jobPostId} med status: ${data.status}`,
			);
		},
	},
};
