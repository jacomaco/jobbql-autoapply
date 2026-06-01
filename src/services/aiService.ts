import { ApplyType } from "../types/enums.ts";

export async function analyzeJobWithAI(cvText: string, jobDescription: string) {
	// Mock-implementation
	return {
		match: true,
		applicationType: ApplyType.Manual,
		customizedCvText:
			"# Anpassat CV\nDetta är ett AI-genererat CV baserat på profilen.",
	};
}
