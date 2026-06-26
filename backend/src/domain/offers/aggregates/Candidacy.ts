import { GenericError } from "src/domain/shared/errors/Generic.error.js"
import { CandidacyAnnotation } from "../value-objects/CandidacyAnnotation.ts"
import { CandidacyStatus } from "../value-objects/CandidacyStatus.ts"
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts"
import { OfferPipeline } from "../value-objects/OfferPipeline.ts"
import { UUID } from "src/domain/shared/value-objects/UUID.ts"

export class Candidacy {

    constructor(
        private readonly uuid: UUID, 
        private readonly offerUuid: UUID,
        private readonly candidateUuid: UUID,

        private status: CandidacyStatus,
        private currentPhaseOrder: number,

        private score: number,
        private annotations: CandidacyAnnotation[],
        
        private rejectReason: string,
        
        private readonly createdAt: Date,
        private updatedAt: Date
    ) { }


    static reconstitute(uuid: string, offerUuid: string, candidateUuid: string,
        status: CandidacyStatus, currentPhaseOrder: number, score: number, annotations: { type: "positive" | "negative" | "neutral", body: string }[],
        rejectionReason: string | undefined, createdAt: Date, updatedAt: Date
    ) { 
        return new Candidacy(
            new UUID(uuid), new UUID(offerUuid), new UUID(candidateUuid),
            status, currentPhaseOrder, score, annotations, 
            rejectionReason ?? "", createdAt, updatedAt
        )
    }

    static create(offerUuid: string, candidateUuid: string) {
        return new Candidacy(
            new UUID(crypto.randomUUID()), new UUID(offerUuid), new UUID(candidateUuid),
            CandidacyStatus.APPLIED, 0, -1, [], 
            "", new Date(), new Date()
        )
    }

    getUuid(): UUID { return this.uuid }
    getOfferUuid(): UUID { return this.offerUuid }
    getCandidateUuid(): UUID { return this.candidateUuid }

    getStatus(): CandidacyStatus { return this.status }
    getCurrentPhaseOrder(): number { return this.currentPhaseOrder }
    
    getScore(): number | undefined { return this.score }
    getAnnotations(): CandidacyAnnotation[] { return this.annotations }

    getRejectionReason(): string {
        return (this.rejectReason.length > 0) 
        ? this.rejectReason 
        : ""
    }

    getCreationDate(): Date { return this.createdAt }
    getLastUpdateDate(): Date { return this.updatedAt }

    private isTerminalState(): boolean {
        const statesMap: Record<CandidacyStatus, boolean> = {
            [CandidacyStatus.REJECTED]: true,
            [CandidacyStatus.WITHDRAWN]: true,
            [CandidacyStatus.HIRED]: true,

            [CandidacyStatus.APPLIED]: false,
            [CandidacyStatus.SCREENING]: false,
            [CandidacyStatus.INTERVIEWING]: false,
            [CandidacyStatus.OFFER]: false,
        } 

        return statesMap[this.status]
    }   

    advance(data: OfferPipeline): Result<void, GenericError> {
        if (this.isTerminalState()) return Err({ message: "This candidacy has ended", code: "ERR_DOM_CANDIDACY_ENDED" })
        const next = data.next(this.currentPhaseOrder)

        if (!next.ok) return next

        this.currentPhaseOrder = next.value.getOrder()
        this.status = next.value.getStatus()
        this.updatedAt = new Date()

        return Ok(undefined)
    }

    hire(): Result<void, GenericError> {
        if (this.status === CandidacyStatus.OFFER) {
            this.updatedAt = new Date()
            this.status = CandidacyStatus.HIRED
            return Ok(undefined)
        } else {
            return Err({ message: "Candidate must be in Offer state to be hired", code: "ERR_DOM_CANDIDACY_HIRING" })
        }
    }

    reject(reason: string): Result<void, GenericError> {
        if (this.isTerminalState()) return Err({ message: "You can't reject a hired candidate", code: "ERR_DOM_CANDIDACY_REJECTION" })
        if (reason.length == 0) {
            return Err({ message: "Undefined reject reason, please specify one", code: "ERR_DOM_CANDIDACY_REJECTION" })
        } else {
            this.updatedAt = new Date()
            this.rejectReason = reason
            this.status = CandidacyStatus.REJECTED
            return Ok(undefined)
        }
    }

    withdraw(): Result<void, GenericError> {
        if (this.isTerminalState()) return Err({ message: "A hired candidate can't withdraw", code: "ERR_DOM_CANDIDACY_WITHDRAWING" })
        this.status = CandidacyStatus.WITHDRAWN
        this.updatedAt = new Date()
        return Ok(undefined)
    }

    evaluate(
        score: number, 
        annotations: { type: "positive" | "negative" | "neutral", body: string }[]): Result<void, GenericError> {
            if (score < 0 || score > 100) return Err({ message: "Score must be between 0 and 100.", code: "ERR_DOM_CANDIDACY_WRONG_SCORE" })
            
            this.score = score
            this.annotations = annotations

            return Ok(undefined)
    }
}