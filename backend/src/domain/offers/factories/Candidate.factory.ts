import { ContactDetails } from "../value-objects/ContactDetails.ts"
import { Candidate, CandidateCertification, CandidateEducation, CandidateLanguage, CandidateProject, WorkExperience } from "../aggregates/Candidate.ts"

type ContactDetailsParams = {
    phoneNumber?: string
    address?: string
    email?: string
    website?: string
    github?: string
    linkedin?: string
}

export class CandidateFactory {
    static create(
        uuid: string,
        name: string,
        title: string,
        about: string,
        contactDetails: ContactDetailsParams,
        skills: string[],
        cvPath: string,
        experience?: WorkExperience[],
        projects?: CandidateProject[],
        education?: CandidateEducation[],
        certifications?: CandidateCertification[],
        languages?: CandidateLanguage[],
        volunteering?: string[],
        additionalInfo?: string[]
    ): Candidate {
        const contact = new ContactDetails(
            contactDetails.phoneNumber,
            contactDetails.address,
            contactDetails.email,
            contactDetails.website,
            contactDetails.github,
            contactDetails.linkedin
        )

        return new Candidate(
            uuid, name, title, about,
            contact, skills, cvPath,
            experience, projects, education,
            certifications, languages,
            volunteering, additionalInfo
        )
    }
}
