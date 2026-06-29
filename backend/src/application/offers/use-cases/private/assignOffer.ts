import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { UUID } from "src/domain/shared/value-objects/UUID.ts";
import { Err } from "src/domain/shared/types/Result.ts";

// Reasigna el reclutador a cargo de una oferta. El guard de si se puede reasignar
// (p.ej. ofertas cerradas) vive en JobPosting.assignTo() — dominio.
export async function assignOffer(offerUuid: string, recruiterUuid: string, offerRepo: IJobPostingRepository) {
    const offerData = await offerRepo.getByUUID(offerUuid)
    if (!offerData.ok) return Err(offerData.error)

    const offer = offerData.value
    const assigned = offer.assignTo(new UUID(recruiterUuid))
    if (!assigned.ok) return assigned

    return offerRepo.update(offer)
}
