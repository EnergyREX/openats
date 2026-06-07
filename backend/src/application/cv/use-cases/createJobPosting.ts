import { JobPostingFactory } from "src/domain/offers/factories/JobPosting.factory.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { JobPostingCreationParams } from "../types/JobPostingCreationParams.js";

export async function createJobPosting(params: JobPostingCreationParams, jobPostingRepository: IJobPostingRepository): Promise<Result<{ uuid: string }, GenericError>> {

    const jobPosting = JobPostingFactory.create(params.uuid, params.title, params.body, params.contactDetails,
        params.company, params.location, params.salary, params.requirements
    )

    const result = await jobPostingRepository.save(jobPosting)

    if (!result.ok) return Err(result.error)

    return Ok({ uuid: result.value })
}
