import { ContactDetails } from "../value-objects/ContactDetails.ts";
import { WorkEntry } from "../value-objects/WorkEntry.ts";

export class Candidate {
    private readonly uuid: string
    private readonly name: string
    private readonly title: string
    private readonly about: string
    private readonly experience?: WorkEntry[]
    private readonly contactDetails: ContactDetails
    private readonly skills: string[]
    private readonly projects?: WorkEntry[]

    constructor(
        uuid: string, name: string, 
        title: string, about: string, 
        experience: WorkEntry[] | undefined,
        contactDetails: ContactDetails, 
        skills: string[], 
        projects?: WorkEntry[] | undefined) {

        this.uuid = uuid
        this.name = name;
        this.title = title;
        this.about = about;
        this.experience = experience
        this.contactDetails = contactDetails;
        this.skills = skills
        this.projects = projects
    }

    getUuid(): string { return this.uuid }
    getName(): string { return this.name; }
    getTitle(): string { return this.title; }
    getAbout(): string { return this.about; }
    getExperience(): WorkEntry[] | undefined { return this.experience }
    getRequirements(): string[] { return this.skills; }
    getContactDetails(): ContactDetails { return this.contactDetails; }
    getSkills(): string[] { return this.skills }
    getProjects(): WorkEntry[] | undefined { return this.projects }


}