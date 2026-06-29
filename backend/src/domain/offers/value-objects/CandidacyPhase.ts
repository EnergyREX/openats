import { CandidacyStatus } from "./CandidacyStatus.ts"

export class CandidacyPhase {
    constructor(
        private readonly phaseOrder: number,
        private readonly name: string,
        private readonly canonicalStatus: CandidacyStatus
    ) {}

    getOrder(): number { return this.phaseOrder }
    getName(): string { return this.name }
    getStatus(): CandidacyStatus { return this.canonicalStatus }
}