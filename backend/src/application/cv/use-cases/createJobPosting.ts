import { JobPostingFactory } from "src/domain/offers/factories/JobPosting.factory.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result } from "src/domain/shared/types/Result.ts";

export interface CreateJobPostingParams {
    title: string
    body: string
    contactDetails?: {
        name?: string
        phoneNumber?: string
        email?: string
    }
    requirements?: string[]
}

export async function createJobPosting(
    params: CreateJobPostingParams,
    jobPostingRepository: IJobPostingRepository
): Promise<Result<{ uuid: string }, GenericError>> {
    const jobPosting = JobPostingFactory.create(
        "",
        params.title,
        params.body,
        params.contactDetails ?? {},
        params.requirements ? new Set(params.requirements) : undefined
    )

    const result = await jobPostingRepository.save(jobPosting)

    if (!result.ok) {
        return { ok: false, error: { message: result.error.message, code: result.error.code } }
    }

    return { ok: true, value: { uuid: result.value } }
}
