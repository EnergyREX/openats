import { GenericError } from "src/domain/shared/errors/Generic.error.js"
import { Company } from "../value-objects/Company.ts"
import { ContactDetails } from "../value-objects/ContactDetails.ts"
import { OfferLocation } from "../value-objects/OfferLocation.ts"
import { OfferPipeline } from "../value-objects/OfferPipeline.ts"
import { OfferStatus } from "../value-objects/OfferStatus.ts"
import { Salary } from "../value-objects/Salary.ts"
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts"
import { UUID } from "src/domain/shared/value-objects/UUID.ts"

export class JobPosting {
    constructor(
        private readonly uuid: UUID, 
        private ownerUuid: UUID,
        private title: string, 
        private body: string, 
        private pipeline: OfferPipeline,
        private contactDetails: ContactDetails,
        private company: Company,
        private location: OfferLocation,
        private salary: Salary,
        private requirements: Set<string>,
        private status: OfferStatus
    ) {}

    toJson() {
        return {
            uuid: this.uuid,
            title: this.title,
            body: this.body,
            contactDetails: this.contactDetails.toJson(),
            // Un Set serializa a `{}` en JSON; lo aplanamos a array para que los
            // requisitos explícitos lleguen de verdad a quien consuma esto (p. ej. el LLM).
            requirements: [...this.requirements]
        }
    }
    toString(): string {
        return JSON.stringify({
            uuid: this.uuid,
            title: this.title,
            body: this.body,
            contactDetails: this.contactDetails.toJson(),
            requirements: [...this.requirements]
        })
    }
    getUuid(): UUID { return this.uuid }
    getOwnerUuid(): UUID { return this.ownerUuid }
    getTitle(): string { return this.title }
    getBody(): string { return this.body }
    getPipeline(): OfferPipeline { return this.pipeline }
    getRequirements(): Set<string> { return this.requirements }
    getContactDetails(): ContactDetails { return this.contactDetails }
    getCompany(): Company { return this.company }
    getLocation(): OfferLocation { return this.location }
    getSalary(): Salary { return this.salary }
    getStatus(): OfferStatus { return this.status }

    assignTo(recruiter: UUID): Result<void, GenericError> {
        if (this.status === OfferStatus.CLOSED) return Err({ message: "Closed offers cannot be asigned", code: "ERR_DOM_OFFER_ASSIGN" })
            this.ownerUuid = recruiter
            return Ok(undefined)
    }

    publish(): Result<void, GenericError> { 
        if (this.status != OfferStatus.DRAFT) return Err({ message: "You can't publish this offer!", code: "ERR_DOM_OFFER_PUBLISH" })
        this.status = OfferStatus.PUBLISHED 
        return Ok(undefined)
    }

    unpublish(): Result<void, GenericError> {
        if (this.status != OfferStatus.PUBLISHED) return Err({ message: "You can't unpublish this offer!", code: "ERR_DOM_OFFER_UNPUBLISH" })
        this.status = OfferStatus.DRAFT 
        return Ok(undefined)
    }

    close(): Result<void, GenericError> {
        if (this.status !== OfferStatus.PUBLISHED) return Err({ message: "This Offer was closed before!", code: "ERR_DOM_OFFER_CLOSE" })
        this.status = OfferStatus.CLOSED
        return Ok(undefined)
    }

    reopen(): Result<void, GenericError> {
        if (this.status === OfferStatus.CLOSED) {
            this.status = OfferStatus.PUBLISHED
            return Ok(undefined)
        } else {
            return Err({ message: 'This offer is still published!', code: "ERR_DOM_OFFER_REOPEN" })
        }
    }


    changeTitle(title: string): Result<void, GenericError> { 
        this.title = title 
        return Ok(undefined)
    }

    changeBody(body: string): Result<void, GenericError> {
        if (this.requirements != undefined) {
            this.requirements.clear()
        }
        this.body = body
        return Ok(undefined)
    }

    addRequirement(requirement: string): Result<void, GenericError> { 
        this.requirements.add(requirement) 
        return Ok(undefined)
    }
    removeRequirement(requirement: string): Result<void, GenericError> { 
        this.requirements.delete(requirement) 
        return Ok(undefined)
    }
}