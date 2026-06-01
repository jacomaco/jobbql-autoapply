import type { JobPost } from "../types";

export async function fetchJobAdsFromArbetsformedlingen(): Promise<JobPost[]> {
	return [
		{
			id: 1001,
			jobTitle: "Fullstack Utvecklare",
			jobDescription: "Vi söker en MERN-utvecklare...",
		},
		{
			id: 1002,
			jobTitle: "DevOps Engineer",
			jobDescription: "Sökes: Erfarenhet av Docker och GCP...",
		},
	];
}
