import { createJobPosting, CreateJobPostingParams } from "src/application/cv/use-cases/createJobPosting.ts";
import { getAvailableModels } from "src/application/ai/getAvailableModels.ts";
import { JobPostingRepositoryImpl } from "src/infrastructure/repositories/JobPostingRepositoryImpl.ts";
import { startApplication } from "src/application/cv/use-cases/startApplication.ts";
import { xAIClient } from "src/infrastructure/clients/ai/xAiClient.ts";
import { OllamaClient } from "src/infrastructure/clients/ai/OllamaClient.ts";

const provider = process.env.AI_PROVIDER
let aiClient;

switch (provider) {
    case ('xai'):
        aiClient = new xAIClient()
        break;
    case ('ollama'):
        aiClient = new OllamaClient()
        break;
    default:
        throw new Error('AI_PROVIDER was not set.')
}

const jobPostingRepository = new JobPostingRepositoryImpl()

export const offerContainer = {
    postulation: (params: { jobPostingUUID: string, filePath: string, name: string, email: string, phoneNum?: string, website?: string }) =>
        startApplication({ jobPostingUUID: params.jobPostingUUID, filePath: params.filePath, name: params.name, email: params.email, phoneNum: params.phoneNum, website: params.website }),
    createJobPosting: (params: CreateJobPostingParams) => createJobPosting(params, jobPostingRepository),
    models: () => getAvailableModels(aiClient)
}