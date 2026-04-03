export class Application {
    private readonly uuid: string
    private readonly offerUuid: string
    private readonly candidateUuid: string
    private score?: number
    private annotations: string[]
    private isValid?: boolean

    constructor(
        uuid: string, offerUuid: string, candidateUuid: string,
        score?: number, annotations: string[] = [], isValid?: boolean
    ) {
        this.uuid = uuid
        this.offerUuid = offerUuid
        this.candidateUuid = candidateUuid
        this.score = score
        this.annotations = annotations
        this.isValid = isValid
    }

    getUuid(): string { return this.uuid }
    getOfferUuid(): string { return this.offerUuid }
    getCandidateUuid(): string { return this.candidateUuid }
    getScore(): number | undefined { return this.score }
    getAnnotations(): string[] { return [...this.annotations] }
    getIsValid(): boolean | undefined { return this.isValid }

    evaluate(score: number, annotations: string[], isValid: boolean): void {
        this.score = score
        this.annotations = annotations
        this.isValid = isValid
    }
}