import { ContactDetails } from "../value-objects/ContactDetails.ts"
import { WorkEntry } from "../value-objects/WorkEntry.ts"
import { Candidate } from "../aggregates/Candidate.ts"

export class CandidateFactory {
    static create(
        uuid: string,
        name: string,
        title: string,
        about: string,
        skills: string[],
        contactDetails: {
            phoneNumber?: string,
            address?: string,
            email?: string
        },
        experience?: {
            title: string,
            fromDate: Date,
            toDate: Date,
            description?: string,
            additionalFields?: Record<string, string>
        }[],
        projects?: {
            title: string,
            fromDate: Date,
            toDate: Date,
            description?: string,
            additionalFields?: Record<string, string>
        }[]
    ): Candidate {
        return new Candidate(
            uuid,
            name,
            title,
            about,
            experience?.map(e => new WorkEntry(e.title, e.fromDate, e.toDate, e.description, e.additionalFields)),
            new ContactDetails(contactDetails.phoneNumber, contactDetails.address, contactDetails.email),
            skills,
            projects?.map(p => new WorkEntry(p.title, p.fromDate, p.toDate, p.description, p.additionalFields))
        )
    }
}