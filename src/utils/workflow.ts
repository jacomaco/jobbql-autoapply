import { db } from "../db/mockDb";
import type { Application } from "../db/models/Application";
import type { JobPost } from "../db/models/JobPost";
import type { Profile } from "../db/models/Profile";
import type { User } from "../db/models/User";
import { fetchJobAdsFromArbetsformedlingen } from "../services/afService";
import { analyzeJobWithAI } from "../services/aiService";
import { applicationQueue } from "../services/queue";
import { ApplyType } from "../types";

function determineApplyConfiguration(type: ApplyType) {
	switch (type) {
		case ApplyType.Email:
			return { customizedCV: true, customizedEmail: true };
		case ApplyType.Manual:
			return { customizedCV: true, coverLetter: true, sendManually: true };
		case ApplyType.Unknown:
			return { customizedCV: true, coverLetter: true, sendManually: true };
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
		const alreadyProcessed = await db.application.exists(user.id, job.id);
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

		if (analysis.match === false) {
			await db.application.create({
				userId: user.id,
				profileId: profile.id,
				jobPostId: job.id,
				generatedCvText: "",
				status: "Skipped",
			});
			continue;
		}

		try {
			await db.application.create({
				userId: user.id,
				profileId: profile.id,
				jobPostId: job.id,
				generatedCvText: analysis.customizedCvText,
				status: "Queue",
			});

			const config = determineApplyConfiguration(analysis.applicationType);
			await applicationQueue.add({ job, config });
		} catch (error) {
			console.error(`Kunde inte skapa ansökan för jobb ${job.id}.`);
		}
	}
}
