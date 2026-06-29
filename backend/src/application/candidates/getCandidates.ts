import { Candidate } from "src/domain/offers/aggregates/Candidate.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function getCandidates(repo: ICandidateRepository): Promise<Result<Candidate[], GenericError>> {
    const data = await repo.getAll()
    if (!data.ok) return Err(data.error)
    return Ok(data.value)
}