import { Candidate } from "../aggregates/Candidate.ts";
import { Result } from '../../shared/types/Result.ts'
import { getCandidateError } from "../errors/candidate/getCandidate.error.ts";
import { saveCandidateError } from "../errors/candidate/saveCandidate.error.ts";
import { updateCandidateError } from "../errors/candidate/updateCandidate.error.ts";
import { deleteCandidateError } from "../errors/candidate/deleteCandidate.error.ts";

export interface ICandidateRepository {
    save(value: Candidate): Promise<Result<void, saveCandidateError>>;

    getAll(): Promise<Result<Candidate[], getCandidateError>>
    getSingle(uuid: string): Promise<Result<Candidate, getCandidateError>>
    getInOffer(uuid: string): Promise<Result<Candidate[], getCandidateError>>

    update(value: Candidate): Promise<Result<void, updateCandidateError>>
    delete(uuid: string): Promise<Result<void, deleteCandidateError>>
}