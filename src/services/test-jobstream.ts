const baseUrl = "https://jobstream.api.jobtechdev.se/v2/stream";

const UpdatedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000)
	.toISOString()
	.substring(0, 19);

const params = new URLSearchParams();
if (UpdatedAfter) {
	params.append("updated-after", UpdatedAfter);
}

const finalUrl = `${baseUrl}?${params.toString()}`;

const TARGET_OCCUPATION_FIELD = "apaJ_2ja_LuF";
const TARGET_LOCATION = "AvNB_uwa_6n6";

// 1. Skapa ett interface som berättar för TypeScript hur ett jobb ser ut
interface JobAd {
	headline: string;
	removed?: boolean;
	occupation_field?: {
		concept_id: string;
	};
	workplace_address?: {
		municipality_concept_id: string;
	};
	// [key: string]: any talar om för TS att det finns massa andra fält också,
	// men vi bryr oss bara om de ovanstående just nu.
	[key: string]: any;
}

async function fetchAndFilterJobs() {
	try {
		console.log(`Hämtar annonser uppdaterade efter: ${UpdatedAfter}...`);
		const response = await fetch(finalUrl);

		if (!response.ok) {
			throw new Error(`Nätverksfel: ${response.status}`);
		}

		// 2. Casta responsen till en array av vårt JobAd-interface
		const allJobs = (await response.json()) as JobAd[];
		console.log(`Hämtade totalt ${allJobs.length} annonser från Stream API.`);

		const itJobsInStockholm = allJobs.filter((job) => {
			if (job.removed) return false;

			const isIT = job.occupation_field?.concept_id === TARGET_OCCUPATION_FIELD;
			const isStockholm =
				job.workplace_address?.municipality_concept_id === TARGET_LOCATION;

			return isIT && isStockholm;
		});

		console.log(
			`🎉 Succé! Hittade ${itJobsInStockholm.length} aktuella IT-jobb i Stockholm.`,
		);

		if (itJobsInStockholm.length > 0) {
			console.log("--- RESULTAT ---");
			for (const job of itJobsInStockholm) {
				console.log(job.headline);
			}
		}

		return itJobsInStockholm;
	} catch (error) {
		console.error("Något gick fel vid hämtningen:", error);
	}
}

fetchAndFilterJobs();
