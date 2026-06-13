
import type { JobPost } from "../models/JobPost";
import getStreamUrl from "./getStreamUrl";

// const STREAM_URL = "https://jobstream.api.jobtechdev.se/stream";

export async function* fetchJobAdsFromArbetsformedlingen(): AsyncGenerator<
	JobPost,
	void,
	unknown
> {
	const controller = new AbortController();

	const fetchUrl = getStreamUrl();


	try {
		const response = await fetch(fetchUrl, {
			headers: { Accept: "application/json" },
			signal: controller.signal,
		});

		if (!response.ok) throw new Error(`HTTP-fel: ${response.status}`);
		if (!response.body) throw new Error("Body är tom");

		const rawJobs: any[] = await response.json();

		for (const rawJob of rawJobs) {
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
