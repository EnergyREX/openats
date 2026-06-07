import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { IApplicationQueue } from "src/application/ports/IApplicationQueue.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { toCommonErrorHandle } from "src/domain/shared/helpers/ToCommonErrorHandle.ts";

export async function startApplication(
    data: { jobPostingUUID: string, filePath: string, name: string, email: string, phoneNum?: string, website?: string }, 
    queue: IApplicationQueue,
    jobPostingRepository: IJobPostingRepository
    ): Promise<Result<void, GenericError>> {
    try {
        const existingOffer = await jobPostingRepository.getByUUID(data.jobPostingUUID)
        if (!existingOffer.ok) return Err(existingOffer.error)
        
        await queue.schedule(data)

        return Ok(undefined)
    } catch (err) {
        return Err(toCommonErrorHandle(err, 'ERR_START_JOB_APPLICATION'))
    }

}