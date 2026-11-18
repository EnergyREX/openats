import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { Err, Ok } from "src/domain/shared/types/Result.ts";

export async function deleteCandidate(uuid: string, repository: ICandidateRepository) {
    try {
        await repository.delete(uuid)
        return Ok(undefined)
    } catch (err) {
        return Err(toError(err, "ERR_APPL_DELETE_CANDIDATE"))
    }
}
