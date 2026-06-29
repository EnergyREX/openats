import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { Err } from "src/domain/shared/types/Result.ts";

export async function rejectCandidacy(uuid: string, reason: string, candidacyRepo: ICandidacyRepository) {

    const candidacyData = await candidacyRepo.getByUUID(uuid)
    if (!candidacyData.ok) return Err(candidacyData.error)

    const candidacy = candidacyData.value
    candidacy.reject(reason)

    candidacyRepo.update(candidacy)
}