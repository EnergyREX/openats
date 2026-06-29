import { JobPostingFactory } from "src/domain/offers/factories/JobPosting.factory.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { OfferPipeline } from "src/domain/offers/value-objects/OfferPipeline.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { JobPostingCreationParams } from "../../types/JobPostingCreationParams.js";
import { toError } from "src/domain/shared/helpers/ToError.ts";

export class CreateOffer {
    
    constructor ( private readonly offerRepo: IJobPostingRepository ) { }

    async exec(data: JobPostingCreationParams): Promise<Result<void, GenericError>> {
        const jobPosting = JobPostingFactory.create(
            data.uuid, data.ownerUuid, data.title, data.body, OfferPipeline.default(), data.contactDetails, data.company,
            data.location, data.salary, data.requirements
        )
        
        try {
            const result = await this.offerRepo.save(jobPosting)
            if (!result.ok) return Err(result.error)
            return Ok(undefined)
        } catch (err) { return Err(toError(err, "ERR_APPL_CREATE_OFFER")) }
    }
}