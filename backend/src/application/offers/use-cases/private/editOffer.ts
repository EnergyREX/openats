import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export interface offerEditableParams {
    body: string
}

export async function editOffer(uuid: string, repository: IJobPostingRepository): Promise<Result<void, GenericError>> {
    const rawData = await repository.getByUUID(uuid)
    if (!rawData.ok) return Err(rawData.error)

    const offer = rawData.value
    offer.publish()
    repository.update(offer)

    return Ok(undefined)
}