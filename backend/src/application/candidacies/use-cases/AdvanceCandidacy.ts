import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { Err } from "src/domain/shared/types/Result.ts";

export async function advanceCandidacy(uuid: string, candidacyRepo: ICandidacyRepository, offerRepo: IJobPostingRepository) {

    const candidacyData = await candidacyRepo.getByUUID(uuid)
    if (!candidacyData.ok) return Err(candidacyData.error)

    const candidacy = candidacyData.value

    const offerData = await offerRepo.getByUUID(candidacy.getOfferUuid().toPrimitive())
    if (!offerData.ok) return Err(offerData.error)

    const advanced = candidacy.advance(offerData.value.getPipeline())
    if (!advanced.ok) return advanced

    return candidacyRepo.update(candidacy)
}