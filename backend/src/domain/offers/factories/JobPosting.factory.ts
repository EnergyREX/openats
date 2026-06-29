import { ContactDetails } from "../value-objects/ContactDetails.ts"
import { JobPosting } from "../aggregates/JobPosting.ts"
import { Company } from "../value-objects/Company.ts"
import { OfferLocation } from "../value-objects/OfferLocation.ts"
import { Salary } from "../value-objects/Salary.ts"
import { OfferPipeline } from "../value-objects/OfferPipeline.ts"
import { OfferStatus } from "../value-objects/OfferStatus.ts"
import { UUID } from "../../shared/value-objects/UUID.ts"

export class JobPostingFactory {
    static create(
        uuid: string,
        ownerUuid: string,
        title: string,
        body: string,
        offerPipeline: OfferPipeline,
        contactDetails: {
            phoneNumber?: string,
            address?: string,
            email?: string
        },
        company: {
            name: string,
            size: string,
            website: string,
            industry: string
        },
        location: {
            city: string,
            country: string,
            modality: string
        },
        salary: {
            min: number,
            max:number,
            currency: string,
            period: string,
            equity: boolean
        },
        requirements?: Set<string>
    ): JobPosting {
        const contactDetail = new ContactDetails(contactDetails.phoneNumber, contactDetails.address, contactDetails.email)
        const offerCompany = new Company(company.name, company.size, company.website, company.industry)
        const offerLocation = new OfferLocation(location.city, location.country, location.modality)
        const offerSalary = new Salary(salary.min, salary.max, salary.currency, salary.period, salary.equity)
        return new JobPosting(
            new UUID(uuid), new UUID(ownerUuid), title, body, offerPipeline,
            contactDetail, offerCompany, offerLocation,
            offerSalary,
            requirements ? requirements : new Set<string>, OfferStatus.DRAFT)
    }  
}