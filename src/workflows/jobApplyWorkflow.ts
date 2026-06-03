import { ApplicationModel } from "../models/Application";
import type { JobPost } from "../models/JobPost";
import type { Profile } from "../models/Profile";
import type { User } from "../models/User";
import { fetchJobAdsFromArbetsformedlingen } from "../services/afService";
import { analyzeJobWithAI } from "../services/aiService";
import { applicationQueue } from "../services/queue";
import { ApplyType } from "../types/enums";

function determineApplyConfiguration(type: ApplyType) {
	switch (type) {
		case ApplyType.Email:
			return { customizedCV: true, customizedEmail: true };
		case ApplyType.Manual:
		case ApplyType.Unknown:
		default:
			return { customizedCV: true, coverLetter: true, sendManually: true };
	}
}

async function* generateTasks(
	data: JobPost[],
): AsyncGenerator<JobPost, void, unknown> {
	for (const job of data) {
		yield job;
	}
}

export async function startWorkflow(user: User, profile: Profile) {
	const rawData = await fetchJobAdsFromArbetsformedlingen();

	for await (const job of generateTasks(rawData)) {
		// KONTROLL 1: Kolla direkt via Mongoose om ansökan finns
		const alreadyProcessed = await ApplicationModel.exists({
			userId: user._id,
			jobPostId: job.id,
		});

		if (alreadyProcessed) {
			console.log(
				`Hoppar över jobb ${job.id} (${job.jobTitle}) - Redan hanterat.`,
			);
			continue;
		}

		const analysis = await analyzeJobWithAI(
			profile.baseCvText,
			job.jobDescription,
		);

		// KONTROLL 2: Om AI:n säger att det inte är en match, spara som "Skipped"
		if (analysis.match === false) {
			await ApplicationModel.create({
				userId: user._id,
				profileId: profile._id,
				jobPostId: job.id,
				generatedCvText: "",
				status: "Skipped",
			});
			continue;
		}

		// 4. MATCH! Skapa ansökan i databasen
		try {
			await ApplicationModel.create({
				userId: user._id,
				profileId: profile._id,
				jobPostId: job.id,
				generatedCvText: analysis.customizedCvText,
				status: "Queue",
			});

			const config = determineApplyConfiguration(analysis.applicationType);
			await applicationQueue.add({ job, config });
		} catch (error: any) {
			// Fångar upp MongoDB:s duplicate key error (11000) som triggas av vårt unika index
			if (error.code === 11000) {
				console.log(
					`Jobb ${job.id} hanterades precis av en annan process. Hoppar över.`,
				);
			} else {
				console.error(
					`Kunde inte skapa ansökan för jobb ${job.id}:`,
					error.message,
				);
			}
		}
	}
}
