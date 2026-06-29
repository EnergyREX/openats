import { CandidateAdditionalInfo } from "../types/CandidateAdditionalInfo.js";
import { CandidateVolunteering } from "../types/CandidateVolunteering.js";
import { ContactDetails } from "../value-objects/ContactDetails.ts";

export interface WorkExperience {
    company: string
    location?: string
    role: string
    duration: string
    responsibilities: string[]
}

export interface CandidateEducation {
    title: string
    institution: string
    duration: string
    gpa?: string
}

export interface CandidateCertification {
    title: string
    institution: string
    duration: string
}

export interface CandidateProject {
    title: string
    description?: string
}

export interface CandidateLanguage {
    language: string
    level: string
}

export class Candidate {
    constructor(
        private uuid: string,
        private readonly name: string,
        private readonly title: string,
        private readonly about: string,
        private readonly contactDetails: ContactDetails,
        private readonly skills: string[],
        private readonly cvPath: string,
        private readonly experience?: WorkExperience[],
        private readonly projects?: CandidateProject[],
        private readonly education?: CandidateEducation[],
        private readonly certifications?: CandidateCertification[],
        private readonly languages?: CandidateLanguage[],
        private readonly volunteering?: CandidateVolunteering,
        private readonly additionalInfo?: CandidateAdditionalInfo,
    ) { }



    toJson(): unknown { return {
        uuid: this.uuid,
        name: this.name,
        title: this.title,
        about: this.about,
        contactDetails: this.contactDetails.toJson(),
        skills: this.skills,
        cvPath: this.cvPath,
        experience: this.experience?.toString(),
        projects: this.projects?.toString(),
        education: this.education?.toString(),
        certifications: this.certifications?.toString(),
        languages: this.languages?.toString(),
        volunteering: this.volunteering,
        additionalInfo: this.additionalInfo
    } }

    toString(): string {
        return JSON.stringify({
            uuid: this.uuid,
            name: this.name,
            title: this.title,
            about: this.about,
            contactDetails: this.contactDetails.toJson(),
            skills: this.skills,
            cvPath: this.cvPath,
            experience: this.experience,
            projects: this.projects,
            education: this.education,
            certifications: this.certifications,
            languages: this.languages,
            volunteering: this.volunteering,
            additionalInfo: this.additionalInfo
        })
    }

    getUuid(): string { return this.uuid }
    setUuid(uuid: string): void { this.uuid = uuid }
    getName(): string { return this.name }
    getTitle(): string { return this.title }
    getAbout(): string { return this.about }
    getContactDetails(): ContactDetails { return this.contactDetails }
    getSkills(): string[] { return this.skills }
    getExperience(): WorkExperience[] | undefined { return this.experience }
    getProjects(): CandidateProject[] | undefined { return this.projects }
    getEducation(): CandidateEducation[] | undefined { return this.education }
    getCertifications(): CandidateCertification[] | undefined { return this.certifications }
    getLanguages(): CandidateLanguage[] | undefined { return this.languages }
    getVolunteering(): unknown | undefined { return this.volunteering }
    getAdditionalInfo(): unknown | undefined { return this.additionalInfo }
    getCvPath(): string { return this.cvPath }

}
