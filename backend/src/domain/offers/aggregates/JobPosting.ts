import { ContactDetails } from "../value-objects/ContactDetails.ts"

export class JobPosting {
    private readonly uuid: string
    private title: string
    private body: string
    private contactDetails: ContactDetails
    private requirements: Set<string>

    constructor(
        uuid: string, 
        title: string, 
        body: string, 
        contactDetails: ContactDetails,
        requirements: Set<string> = new Set(),
    ) {
        this.uuid = uuid
        this.title = title
        this.body = body
        this.contactDetails = contactDetails
        this.requirements = requirements
    }
    getUuid(): string { return this.uuid }
    getTitle(): string { return this.title }
    getBody(): string { return this.body }
    getRequirements(): Set<string> { return new Set(this.requirements) }
    getContactDetails(): ContactDetails { return this.contactDetails }

    changeTitle(title: string): void { this.title = title }

    changeBody(body: string): void {
        if (this.requirements != undefined) {
            this.requirements.clear()
        }
        this.body = body
    }

    addRequirement(requirement: string): void { this.requirements.add(requirement) }
    removeRequirement(requirement: string): void { this.requirements.delete(requirement) }
}