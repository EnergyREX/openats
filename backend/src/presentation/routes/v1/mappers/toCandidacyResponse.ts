import { Candidacy } from "src/domain/offers/aggregates/Candidacy.ts";

export function toCandidacyResponse(c: Candidacy) {
    return {
        uuid: c.getUuid().toPrimitive(),
        offerUuid: c.getOfferUuid().toPrimitive(),
        candidateUuid: c.getCandidateUuid().toPrimitive(),
        status: c.getStatus(),
        currentPhaseOrder: c.getCurrentPhaseOrder(),
        score: c.getScore(),
        annotations: c.getAnnotations(),
        rejectionReason: c.getRejectionReason(),
        createdAt: c.getCreationDate(),
        updatedAt: c.getLastUpdateDate(),
    }
}