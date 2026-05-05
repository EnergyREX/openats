import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";

export function getCandidate(uuid: string, candidateRepository: ICandidateRepository) {
    return candidateRepository.getByUUID(uuid)
}