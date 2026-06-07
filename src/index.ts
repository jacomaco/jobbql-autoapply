import * as mongoose from "mongoose";
import { ApplicationModel } from "./models/Application";
import type { Profile } from "./models/Profile";
import { ProfileModel } from "./models/Profile";
import type { User } from "./models/User";
import { UserModel } from "./models/User";
import { startWorkflow } from "./workflows/jobApplyWorkflow";

// Hämta och säkra upp environment-variablerna
if (!process.env.DB_USER || !process.env.DB_PASSWORD) {
	throw new Error(
		"Error: DB_USER or DB_PASSWORD is not set in environment variables. Make sure your env file (e.g., .env.development or .env.test) is loaded and has these variables configured.",
	);
}
const dbUser = encodeURIComponent(process.env.DB_USER);
const dbPassword = encodeURIComponent(process.env.DB_PASSWORD.trim());

// Tvinga direktanslutning till IPv4 localhost med directConnection=true
const MONGO_URI = `mongodb://${dbUser}:${dbPassword}@127.0.0.1:27017/jobbql?authSource=admin&directConnection=true`;

async function main() {
	await mongoose.connect(MONGO_URI);
	console.log("Databas ansluten.");

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

		if (!testUser || !testProfile) {
			throw new Error("Misslyckades med att skapa testdata. Avbryter.");
		}

		console.log(`Startar workflow för profil: "${testProfile.profileName}"`);

		// --- 2. KÖR PROGRAMMET ---
		await startWorkflow(testUser, testProfile);

		// Skriv ut en rapport från databasen
		console.log("\n--- RESULTAT I DATABASEN ---");

		// Hämta alla ansökningar som skapades för testanvändaren
		const savedApplications = await ApplicationModel.find({
			userId: testUser._id,
		});

		console.log(`Hittade ${savedApplications.length} sparade ansökningar.`);

		for (const app of savedApplications) {
			console.log(`- Jobb ID: ${app.jobPostId}`);
			console.log(`  Status: ${app.status}`);
			// Skriv ut de första 50 tecknen av CV:t för att se att AI:n "fungerade"
			console.log(
				`  CV Preview: ${app.generatedCvText.substring(0, 50).replace(/\n/g, " ")}...`,
			);
		}
		console.log("----------------------------");
	} catch (error) {
		console.error("Ett fel uppstod under körningen:", error);
	} finally {
		// --- 3. TEARDOWN: Städa upp ---
		console.log("\nStädar upp i databasen...");

		if (testUser) {
			await UserModel.findByIdAndDelete(testUser._id);
			await ApplicationModel.deleteMany({ userId: testUser._id }); // Nu tar vi bort dem också!
		}
		if (testProfile) {
			await ProfileModel.findByIdAndDelete(testProfile._id);
		}

		console.log("Testdata borttagen. Stänger anslutningen.");
		await mongoose.disconnect();
	}
}

main().catch(console.error);
