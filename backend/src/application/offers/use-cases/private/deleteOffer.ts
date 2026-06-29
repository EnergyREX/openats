import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { Err, Ok } from "src/domain/shared/types/Result.ts";

export async function deleteOffer(uuid: string, jobPostingRepository: IJobPostingRepository) {
    try {
        await jobPostingRepository.delete(uuid)
        return Ok(undefined)
    } catch (err) {
        return Err(toError(err, "ERR_APPL_DELETE_OFFER"))
    }

}