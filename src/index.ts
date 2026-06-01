import * as mongoose from "mongoose";
import { Types } from "mongoose"; // Importera Types
import type { Profile } from "./db/models/Profile.ts";
import type { User } from "./db/models/User.ts";
import { startWorkflow } from "./utils/workflow";

// connect to database
// Bun läser automatiskt in din .env-fil till process.env
const dbUser = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const MONGO_URI = `mongodb://${dbUser}:${dbPassword}@localhost:27017/jobbql?authSource=admin`;
await mongoose.connect(MONGO_URI);

// Läs in fil med Buns filhantering
const cvFile = Bun.file("CV.md");

async function main() {
	// Generera två unika test-ID:n som matchar MongoDB:s struktur
	const mockUserId = new Types.ObjectId();
	const mockProfileId = new Types.ObjectId();

	const currentUser: User = {
		_id: mockUserId,
		email: "jacob@example.com",
		createdAt: new Date(),
	};

	const activeProfile: Profile = {
		_id: mockProfileId,
		userId: mockUserId, // Matchar användarens ID
		profileName: "Fullstack Node/React",
		baseCvText: await cvFile.text(),
	};

	console.log(`Startar workflow för profil: "${activeProfile.profileName}"`);
	await startWorkflow(currentUser, activeProfile);
}

main().catch(console.error);
