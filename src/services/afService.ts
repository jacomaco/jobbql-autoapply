import type { JobPost } from "../models/JobPost";
const BASE_URL = "https://jobstream.api.jobtechdev.se";
const STREAM_URL = `${BASE_URL}/stream`;
const SNAPSHOT_URL = `${BASE_URL}/snapshot`;

export async function fetchJobAdsFromArbetsformedlingen(): Promise<JobPost[]> {
	let responseSize = 0;
	try {
		const response = await fetch(SNAPSHOT_URL);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		if (!response.body) {
			throw new Error("Response body is null");
		}

		for await (const chunk of response.body) {
			responseSize += 1;
		}
	} catch (error) {
		console.error(error);
	}
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
