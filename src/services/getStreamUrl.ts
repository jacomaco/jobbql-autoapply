function getStreamUrl() {
	const baseUrl = "https://jobstream.api.jobtechdev.se/v2/stream";

	// Hämtar tid för exakt 24h sedan, API:et kräver minuter och sekunder (:00:00)
	const UpdatedAfter = new Date(Date.now() - 24 * 60 * 60 * 1000)
		.toISOString()
		.split(":")[0]
		?.trim();

	enum Locations {
		Stockholm = "AvNB_uwa_6n6",
		// VastraGotaland = "v9Ke_99L_UvW", Jag vet inte om dessa fungerar, det verkar inte som det.
		// Skane = "caYg_478_Yw6",
	}

	// Din sammankopplade datastruktur
	const filterMapping = {
		"location-concept-id": [Locations.Stockholm],
	};

	const params = new URLSearchParams();

	if (UpdatedAfter) {
		params.append("updated-after", UpdatedAfter);
	}

	Object.entries(filterMapping).forEach(([paramKey, values]) => {
		values.forEach((id) => {
			params.append(paramKey, id);
		});
	});

	const finalUrl = `${baseUrl}?${params.toString()}`;
	console.log(finalUrl);

	console.log("---");
}
getStreamUrl();
export default getStreamUrl;
