export interface User {
	id: number;
	email: string;
	createdAt: Date;
}

export interface Profile {
	id: number;
	userId: number;
	profileName: string;
	baseCvText: string;
}

export interface JobPost {
	id: number;
	jobTitle: string;
	jobDescription: string;
}

export interface Application {
	id: number;
	userId: number;
	profileId: number;
	jobPostId: number;
	generatedCvText: string;
	status: string;
}

export enum ApplyType {
	Email = "Email",
	TeamTailor = "TeamTailor",
	Manual = "Manual",
	Unknown = "Unknown",
}
