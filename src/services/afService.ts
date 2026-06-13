import JSONStream from "JSONStream";
import { Readable } from "node:stream";
import type { JobPost } from "../models/JobPost";
import getStreamUrl from "./getStreamUrl";

// const STREAM_URL = "https://jobstream.api.jobtechdev.se/stream";
const STREAM_URL = getStreamUrl();

export async function* fetchJobAdsFromArbetsformedlingen(): AsyncGenerator<
	JobPost,
	void,
	unknown
> {
	const controller = new AbortController();

	// 1. Skapa en dynamisk tidstämpel för "24 timmar sedan"
	const yesterday = new Date();
	yesterday.setHours(yesterday.getHours() - 24);

	// API:et vill ha formatet YYYY-MM-DDTHH:MM:SS
	const timestamp = yesterday.toISOString().split(".")[0];

	const fetchUrl = `${STREAM_URL}?date=${timestamp}`;
	console.log(`Hämtar annonser från de senaste 24 timmarna (${timestamp})...`);

	try {
		const response = await fetch(fetchUrl, {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});

		if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`);
		if (!response.body) throw new Error("Body är tom");

		const nodeStream = Readable.fromWeb(response.body);
		const parser = JSONStream.parse("*");

		nodeStream.pipe(parser);

		for await (const rawJob of parser) {
			const mappedJob: JobPost = {
				id: rawJob.id,
				headline: rawJob.headline || "Ingen titel",
				jobDescription: rawJob.description?.text || "",
				removed: rawJob.removed === true,
			};
			yield mappedJob;
		}
	} catch (error: any) {
		if (error.name !== "AbortError") {
			console.error("Nätverksfel vid hämtning av jobb:", error);
		}
	} finally {
		controller.abort();
	}
}
