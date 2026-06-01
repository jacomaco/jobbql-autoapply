import type { Profile, User } from "./types";
import { startWorkflow } from "./utils/workflow";

// Läs in fil med Buns filhantering
const cvFile = Bun.file("CV.md");

async function main() {
	const currentUser: User = {
		id: 42,
		email: "jacob@example.com",
		createdAt: new Date(),
	};

	const activeProfile: Profile = {
		id: 1,
		userId: 42,
		profileName: "Fullstack Node/React",
		baseCvText: await cvFile.text(),
	};

	console.log(`Startar workflow för profil: "${activeProfile.profileName}"`);
	await startWorkflow(currentUser, activeProfile);
}

main().catch(console.error);
