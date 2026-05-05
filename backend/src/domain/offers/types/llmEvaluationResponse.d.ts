import { ApplicationAnnotation } from "../value-objects/ApplicationAnnotation.ts"

export type llmEvaluationResponse = {
    score: number
    annotations?: ApplicationAnnotation[]
    suggestedStatus: "discarded" | "interview" | "review"
    discardReason: string
}