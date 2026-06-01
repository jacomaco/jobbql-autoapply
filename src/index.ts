import * as mongoose from "mongoose";
import { ApplicationModel } from "./models/Application";
import type { Profile } from "./models/Profile";
import { ProfileModel } from "./models/Profile";
import type { User } from "./models/User";
import { UserModel } from "./models/User";
import { startWorkflow } from "./utils/workflow";

// Ladda in environment (se till att du använder din config-fil här sen)
const dbUser = encodeURIComponent(process.env.DB_USER || "");
const dbPassword = encodeURIComponent((process.env.DB_PASSWORD || "").trim());

const MONGO_URI = `mongodb://${dbUser}:${dbPassword}@127.0.0.1:27017/jobbql?authSource=admin&directConnection=true`;

async function main() {
	await mongoose.connect(MONGO_URI);
	console.log("Databas ansluten.");

	// Skapa variabler utanför try-blocket så vi kommer åt dem i finally
	let testUser: User | null = null;
	let testProfile: Profile | null = null;

	try {
		// --- 1. SETUP: Skapa Testdata ---
		console.log("Skapar testanvändare och läser in CV...");

		testUser = await UserModel.create({
			email: "test_jobbql@example.com",
		});

		const cvFile = Bun.file("CV.md");
		const cvText = await cvFile.text();

		testProfile = await ProfileModel.create({
			userId: testUser._id,
			profileName: "Fullstack Node/React (Testkörning)",
			baseCvText: cvText,
		});

		console.log(`Startar workflow för profil: "${testProfile.profileName}"`);

		// 🔥 LÄGG TILL DETTA: Type Guard / Säkerhetskontroll
		if (!testUser || !testProfile) {
			throw new Error("Misslyckades med att skapa testdata. Avbryter.");
		}
		// --- 2. KÖR PROGRAMMET ---
		// TypeScript vet automatiskt att testUser och testProfile matchar dina interfaces
		await startWorkflow(testUser, testProfile);
	} catch (error) {
		console.error("Ett fel uppstod under körningen:", error);
	} finally {
		// --- 3. TEARDOWN: Städa upp ---
		console.log("\nStädar upp i databasen...");

		if (testUser) {
			await UserModel.findByIdAndDelete(testUser._id);

			// Frivilligt: Om du vill ta bort de ansökningar som genererades under testet
			// await ApplicationModel.deleteMany({ userId: testUser._id });
		}
		if (testProfile) {
			await ProfileModel.findByIdAndDelete(testProfile._id);
		}

		console.log("Testdata borttagen. Stänger anslutningen.");
		await mongoose.disconnect();
	}
}

main().catch(console.error);
