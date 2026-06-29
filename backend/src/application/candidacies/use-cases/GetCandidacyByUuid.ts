import { Candidacy } from "src/domain/offers/aggregates/Candidacy.ts";
import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { Result, Err, Ok } from "src/domain/shared/types/Result.ts";

export async function getCandidacyByUuid(uuid: string, candidacyRepo: ICandidacyRepository): Promise<Result<Candidacy, GenericError>> {
    try {
        const data = await candidacyRepo.getByUUID(uuid)
        if (!data.ok) return Err(data.error)
        return Ok(data.value)
    } catch (err) {
        return Err(toError(err, "ERR_APPL_GET_CANDIDACIES_BY_UUID"))
    }
}