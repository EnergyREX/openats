import { IApplicationRepository } from "src/domain/offers/repositories/IApplicationRepository.ts";

export function getCandidateEvaluation(candidateUuid: string, applicationRepository: IApplicationRepository) {
    return applicationRepository.getByCandidateUUID(candidateUuid)
}