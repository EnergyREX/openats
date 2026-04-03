import { Application } from "../aggregates/Application.ts"

export class ApplicationFactory {
    static create(
        uuid: string,
        offerUuid: string,
        candidateUuid: string,
        score?: number,
        annotations?: string[],
        isValid?: boolean
    ): Application {
        return new Application(uuid, offerUuid, candidateUuid, score, annotations, isValid)
    }
}