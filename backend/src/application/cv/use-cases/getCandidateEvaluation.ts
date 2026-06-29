import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts"

export function getCandidateEvaluation(candidateUuid: string, applicationRepository: ICandidacyRepository) {
    return applicationRepository.getByCandidateUUID(candidateUuid)
}