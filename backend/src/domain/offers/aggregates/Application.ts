import { ApplicationAnnotation } from "../value-objects/ApplicationAnnotation.ts"

export class Application {

    constructor(
        private readonly uuid: string, 
        private readonly offerUuid: string, 
        private readonly candidateUuid: string,
        private annotations: ApplicationAnnotation[] = [], 
        private suggestedStatus: "discarded" | "interview" | "review",
        private score?: number, 
        private isDiscarded?: boolean,
        private discardReason?: string
    ) { }

    getUuid(): string { return this.uuid }
    getOfferUuid(): string { return this.offerUuid }
    getCandidateUuid(): string { return this.candidateUuid }
    getScore(): number | undefined { return this.score }
    getAnnotations(): ApplicationAnnotation[] { return [...this.annotations] }
    getIsDiscarded(): boolean | undefined { return this.isDiscarded }
    getSuggestedStatus(): string { return this.suggestedStatus }
    getDiscardReason(): string | undefined { return this.discardReason }

    evaluate(score: number, annotations: ApplicationAnnotation[], isValid: boolean, discardReason: string): void {
        this.score = score
        this.annotations = annotations
        this.isDiscarded = !isValid
        this.discardReason = discardReason
    }
}