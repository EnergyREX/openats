import { evaluateCandidate } from "src/application/cv/use-cases/candidateParse.ts";
import { getAvailableModels } from "src/application/ai/getAvailableModels.ts";

export const offerContainer = {
    evaluate: (params: { buffer: Buffer, filename: string }) => evaluateCandidate(params.buffer, params.filename),
    models: () => getAvailableModels()
}