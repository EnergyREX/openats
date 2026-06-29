import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { Err } from "src/domain/shared/types/Result.ts";

export async function hireCandidacy(uuid: string, candidacyRepo: ICandidacyRepository) {

    const candidacyData = await candidacyRepo.getByUUID(uuid)
    if (!candidacyData.ok) return Err(candidacyData.error)

    const candidacy = candidacyData.value
    candidacy.hire()

    candidacyRepo.update(candidacy)
}