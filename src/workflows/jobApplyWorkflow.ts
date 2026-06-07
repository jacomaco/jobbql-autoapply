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
		default:
			return { customizedCV: true, coverLetter: true, sendManually: true };
	}
}

export async function startWorkflow(user: User, profile: Profile) {
	for await (const job of fetchJobAdsFromArbetsformedlingen()) {
		try {
			if (job.removed) {
				continue;
			}
			// KONTROLL 1: Kolla direkt via Mongoose om ansökan finns
			const alreadyProcessed = await ApplicationModel.exists({
				userId: user._id,
				jobPostId: job.id,
			});

			if (alreadyProcessed) {
				console.log(
					`Hoppar över jobb ${job.id} (${job.headline}) - Redan hanterat.`,
				);
				continue;
			}

			// AI-Analys (Varning: Detta kommer ta lång tid för många jobb)
			const analysis = await analyzeJobWithAI(
				profile.baseCvText,
				job.jobDescription,
			);

			// KONTROLL 2: Om AI:n säger att det inte är en match, spara som "Skipped"
			if (!analysis.match) {
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
			// Fångar upp både DB-fel och eventuella AI-timeout-fel i samma try/catch
			if (error.code === 11000) {
				console.log(
					`Jobb ${job.id} hanterades precis av en annan process. Hoppar över.`,
				);
			} else {
				console.error(`Kunde inte hantera jobb ${job.id}:`, error.message);
			}
		}
	}
}
