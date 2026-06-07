import JSONStream from "JSONStream";
import { Readable } from "node:stream";
import type { JobPost } from "../models/JobPost";

const SNAPSHOT_URL = "https://jobstream.api.jobtechdev.se/snapshot";

export async function* fetchJobAdsFromArbetsformedlingen(): AsyncGenerator<
	JobPost,
	void,
	unknown
> {
	const controller = new AbortController();

	try {
		const response = await fetch(SNAPSHOT_URL, {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});

		if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`);
		if (!response.body) throw new Error("Body är tom");

		const nodeStream = Readable.fromWeb(response.body as any);
		const parser = JSONStream.parse("*");

		// Koppla nätverksströmmen till parsern
		nodeStream.pipe(parser);

		// HÄR ÄR MAGIN: Istället för .on("data") väntar vi in varje jobb sekventiellt.
		// När din "startWorkflow" pausar för AI-analys, pausar den även läsningen här automatiskt!
		for await (const job of parser) {
			yield job as JobPost;
		}
	} catch (error: any) {
		if (error.name !== "AbortError") {
			console.error("Nätverksfel vid hämtning av jobb:", error);
		}
	} finally {
		// Säkerställer att anslutningen stängs om generatorn avbryts i förtid
		controller.abort();
	}
}

// import type { JobPost } from "../models/JobPost";
// const BASE_URL = "https://jobstream.api.jobtechdev.se";
// const STREAM_URL = `${BASE_URL}/stream`;
// const SNAPSHOT_URL = `${BASE_URL}/snapshot`;
//
// export async function fetchJobAdsFromArbetsformedlingen(): Promise<JobPost[]> {
// 	let responseSize = 0;
// 	try {
// 		const response = await fetch(SNAPSHOT_URL);
// 		if (!response.ok) {
// 			throw new Error(`HTTP error! status: ${response.status}`);
// 		}
// 		if (!response.body) {
// 			throw new Error("Response body is null");
// 		}
//
// 		for await (const chunk of response.body) {
// 			responseSize += 1;
// 		}
// 	} catch (error) {
// 		console.error(error);
// 	}
// 	return [
// 		{
// 			id: 1001,
// 			jobTitle: "Fullstack Utvecklare",
// 			jobDescription: "Vi söker en MERN-utvecklare...",
// 		},
// 		{
// 			id: 1002,
// 			jobTitle: "DevOps Engineer",
// 			jobDescription: "Sökes: Erfarenhet av Docker och GCP...",
// 		},
// 	];
// }
