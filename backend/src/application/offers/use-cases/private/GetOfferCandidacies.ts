import { Candidacy } from "src/domain/offers/aggregates/Candidacy.ts";
import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export class GetOfferCandidacies {
    constructor(
        private readonly candidacyRepo: ICandidacyRepository
    ) {}

    async exec(offerUuid: string): Promise<Result<Candidacy[], GenericError>> {
        const data = await this.candidacyRepo.getByOffer(offerUuid)
        if (!data.ok) return Err(data.error)
        return Ok(data.value)
    }
}