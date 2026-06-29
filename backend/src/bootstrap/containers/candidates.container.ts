import { CandidateRepositoryImpl } from "src/infrastructure/repositories/CandidateRepositoryImpl.ts";
import { getCandidate } from "src/application/cv/use-cases/getCandidate.ts";
import { getCandidates } from "src/application/candidates/getCandidates.ts";

const candidateRepository = new CandidateRepositoryImpl()

export const candidateContainer = {
    getAll: () => getCandidates(candidateRepository),
    getByUuid: (uuid: string) => getCandidate(uuid, candidateRepository),
}
