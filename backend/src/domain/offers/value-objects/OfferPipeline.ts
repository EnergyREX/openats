import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { CandidacyPhase } from "./CandidacyPhase.ts";
import { CandidacyStatus } from "./CandidacyStatus.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export class OfferPipeline {


    constructor(
        private name: string,
        private readonly phases: CandidacyPhase[]
    ) {
    }

    static default(): OfferPipeline {
        return new OfferPipeline('Standard', [
            new CandidacyPhase(1, 'Screening',    CandidacyStatus.SCREENING),
            new CandidacyPhase(2, 'Interviewing', CandidacyStatus.INTERVIEWING),
            new CandidacyPhase(3, 'Offer',        CandidacyStatus.OFFER),
        ])
    }

    getName(): string { return this.name }
    getPhases(): CandidacyPhase[] { return this.phases }

    getPhasesCount(): number { return this.phases.length }

    next(phaseNum: number): Result<CandidacyPhase, GenericError> {
        const result = this.phases.find((p) => p.getOrder() == phaseNum + 1)
        
        return result 
        ? Ok(result) 
        : Err({ message: 'There are no more status after this', code: "ERR_DOM_OFFERPIPELINE_GET"})
    }
}