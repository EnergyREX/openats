import { Result } from '../../shared/types/Result.ts'
import { Candidacy } from '../aggregates/Candidacy.ts';
import { deleteCandidacyError } from '../errors/candidacy/deleteCandidacy.error.ts';
import { getCandidacyError } from '../errors/candidacy/getCandidacy.error.ts';
import { saveCandidacyError } from '../errors/candidacy/saveCandidacy.error.ts';
import { updateCandidacyError } from '../errors/candidacy/updateCandidacy.error.ts';

export interface ICandidacyRepository {
    save(value: Candidacy): Promise<Result<string, saveCandidacyError>>;

    getAll(): Promise<Result<Candidacy[], getCandidacyError>>
    getByUUID(uuid: string): Promise<Result<Candidacy, getCandidacyError>>
    getByCandidateUUID(uuid: string): Promise<Result<Candidacy, getCandidacyError>>
    getByCandidateAndOfferUUID(candidate: string, offer: string): Promise<Result<Candidacy, getCandidacyError>>
    getByOffer(uuid: string): Promise<Result<Candidacy[], getCandidacyError>>
    count(): Promise<number>
    countPendingReview(): Promise<number>

    update(value: Candidacy): Promise<Result<void, updateCandidacyError>>
    delete(uuid: string): Promise<Result<void, deleteCandidacyError>>
}
