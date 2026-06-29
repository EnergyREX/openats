import { JobPostingRepositoryImpl } from "src/infrastructure/repositories/JobPostingRepositoryImpl.ts";
import { startApplication } from "src/application/cv/use-cases/aiParsePipeline/startApplication.ts";
import { xAIClient } from "src/infrastructure/clients/ai/xAiClient.ts";
import { OllamaClient } from "src/infrastructure/clients/ai/OllamaClient.ts";
import { ProcessJobApplicationQueue } from "src/infrastructure/bull/queues/ProcessJobApplication.ts";
import { CreateOffer } from "src/application/offers/use-cases/private/createOffer.ts";
import { JobPostingCreationParams } from "src/application/offers/types/JobPostingCreationParams.js";
import { GetOfferByUUID } from "src/application/offers/use-cases/public/getOfferByUUID.ts";
import { GetOffers } from "src/application/offers/use-cases/public/getOffers.ts";
import { deleteOffer } from "src/application/offers/use-cases/private/deleteOffer.ts";
import { publishOffer } from "src/application/offers/use-cases/private/publishOffer.ts";
import { assignOffer } from "src/application/offers/use-cases/private/assignOffer.ts";
import { getAvailableModels } from "src/application/ai/getAvailableModels.ts";

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

const queue = new ProcessJobApplicationQueue()

const jobPostingRepository = new JobPostingRepositoryImpl()

const createJob = new CreateOffer(jobPostingRepository)
const getJobByUuid = new GetOfferByUUID(jobPostingRepository)
const getJobPostings = new GetOffers(jobPostingRepository)

export const offerContainer = {
    postulation: (params: { jobPostingUUID: string, filePath: string, name: string, email: string, phoneNum?: string, website?: string }) =>
        startApplication({ jobPostingUUID: params.jobPostingUUID, filePath: params.filePath, name: params.name, email: params.email, phoneNum: params.phoneNum, website: params.website }, queue, jobPostingRepository),
    createJobPosting: (params: JobPostingCreationParams) => createJob.exec(params),
    getJobPostingByUUID: (uuid: string) => getJobByUuid.exec(uuid),
    getJobPostings: () => getJobPostings.exec(),
    deleteJobPosting: (uuid: string) => deleteOffer(uuid, jobPostingRepository),
    publishJobPosting: (uuid: string) => publishOffer(uuid, jobPostingRepository),
    assignJobPosting: (uuid: string, recruiterUuid: string) => assignOffer(uuid, recruiterUuid, jobPostingRepository),
    models: () => getAvailableModels(aiClient)
}