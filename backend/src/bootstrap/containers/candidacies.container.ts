import { CandidacyRepositoryImpl } from "src/infrastructure/repositories/CandidacyRepositoryImpl.ts";
import { JobPostingRepositoryImpl } from "src/infrastructure/repositories/JobPostingRepositoryImpl.ts";
import { getCandidacyByUuid } from "src/application/candidacies/use-cases/GetCandidacyByUuid.ts";
import { advanceCandidacy } from "src/application/candidacies/use-cases/AdvanceCandidacy.ts";
import { hireCandidacy } from "src/application/candidacies/use-cases/HireCandidacy.ts";
import { rejectCandidacy } from "src/application/candidacies/use-cases/RejectCandidacy.ts";
// WithdrawCandidacy.ts exporta la función como `rejectCandidacy` (nombre erróneo en origen);
// se renombra aquí para no tocar la capa de aplicación.
import { rejectCandidacy as withdrawCandidacy } from "src/application/candidacies/use-cases/WithdrawCandidacy.ts";
import { GetOfferCandidacies } from "src/application/offers/use-cases/private/GetOfferCandidacies.ts";
import { getCandidateEvaluation } from "src/application/cv/use-cases/getCandidateEvaluation.ts";

const candidacyRepository = new CandidacyRepositoryImpl()
const jobPostingRepository = new JobPostingRepositoryImpl()

const getOfferCandidacies = new GetOfferCandidacies(candidacyRepository)

export const candidacyContainer = {
    getByUuid: (uuid: string) => getCandidacyByUuid(uuid, candidacyRepository),
    getByOffer: (offerUuid: string) => getOfferCandidacies.exec(offerUuid),
    getCandidateEvaluation: (candidateUuid: string) => getCandidateEvaluation(candidateUuid, candidacyRepository),
    advance: (uuid: string) => advanceCandidacy(uuid, candidacyRepository, jobPostingRepository),
    hire: (uuid: string) => hireCandidacy(uuid, candidacyRepository),
    reject: (uuid: string, reason: string) => rejectCandidacy(uuid, reason, candidacyRepository),
    withdraw: (uuid: string) => withdrawCandidacy(uuid, candidacyRepository),
}
