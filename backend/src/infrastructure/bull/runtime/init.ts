import 'dotenv/config'
import { PostulationOrchestrator } from "src/application/cv/use-cases/PostulationOrchestrator.ts"
import { ProcessJobApplicationWorker } from "./workers/ProcessJobApplication.worker.ts"
import { PromptService } from "../../ai/PromptService.ts";
import { CandidateRepositoryImpl } from "../../repositories/CandidateRepositoryImpl.ts";
import { JobPostingRepositoryImpl } from "../../repositories/JobPostingRepositoryImpl.ts";
import { ApplicationRepositoryImpl } from "../../repositories/ApplicationRepositoryImpl.ts";
import { OllamaClient } from "src/infrastructure/clients/ai/OllamaClient.ts";
import { xAIClient } from "src/infrastructure/clients/ai/xAiClient.ts";

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

const promptService = new PromptService()
const candidateRepository = new CandidateRepositoryImpl()
const jobPostingRepository = new JobPostingRepositoryImpl()
const applicationRepository = new ApplicationRepositoryImpl()

const postulationOrchestrator = new PostulationOrchestrator(aiClient, aiClient, promptService, candidateRepository, jobPostingRepository, applicationRepository)

export async function initWorkersAndSchedulers() {
    console.info('[BullMQ] - Initiating Queues and Workers...')
    
    console.info('[BullMQ] - Initiating ProcessJobApplication Worker')
    await ProcessJobApplicationWorker(postulationOrchestrator)
    console.info('[BullMQ] - Initiated ProcessJobApplication Worker successfully')

    console.info('[BullMQ] - Initialized Queues and Workers successfully!')
}

initWorkersAndSchedulers()