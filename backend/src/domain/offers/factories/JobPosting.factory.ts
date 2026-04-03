import { ContactDetails } from "../value-objects/ContactDetails.ts"
import { JobPosting } from "../aggregates/JobPosting.ts"

export class JobPostingFactory {
    
    static create(
        uuid: string,
        title: string,
        body: string,
        contactDetails: {
            name?: string,
            phoneNumber?: string,
            address?: string,
            email?: string
        },
        requirements?: Set<string>
    ): JobPosting {
        return new JobPosting(
            uuid,
            title,
            body,
            new ContactDetails(
                contactDetails.name,
                contactDetails.phoneNumber,
                contactDetails.address,
                contactDetails.email
            ),
            requirements
        )
    }
}