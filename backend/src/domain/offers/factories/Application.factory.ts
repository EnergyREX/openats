import { Application } from "../aggregates/Application.ts"
import { ApplicationAnnotation } from "../value-objects/ApplicationAnnotation.ts"

export class ApplicationFactory {
    static create(
        uuid: string,
        offerUuid: string,
        candidateUuid: string,
        annotations: ApplicationAnnotation[],
        suggestedStatus: "discarded" | "interview" | "review",
        score?: number,
        isDiscarded?: boolean,
        discardReason?: string
    ): Application {
        return new Application(
            uuid, offerUuid, candidateUuid, 
            annotations, suggestedStatus, score, 
            false, discardReason)
    }
}