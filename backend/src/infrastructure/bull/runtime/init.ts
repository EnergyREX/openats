import 'dotenv/config'
import { PostulationOrchestrator } from "src/application/cv/use-cases/aiParsePipeline/PostulationOrchestrator.ts"
import { ProcessJobApplicationWorker } from "./workers/ProcessJobApplication.worker.ts"
import { PromptService } from "../../ai/PromptService.ts";
import { CandidateRepositoryImpl } from "../../repositories/CandidateRepositoryImpl.ts";
import { JobPostingRepositoryImpl } from "../../repositories/JobPostingRepositoryImpl.ts";
import { CandidacyRepositoryImpl } from "../../repositories/CandidacyRepositoryImpl.ts";
import { OllamaClient } from "src/infrastructure/clients/ai/OllamaClient.ts";
import { xAIClient } from "src/infrastructure/clients/ai/xAiClient.ts";
import { IAIClient } from 'src/domain/shared/ports/IAIClient.ts';

const provider = process.env.AI_PROVIDER

if (provider === undefined) throw new Error('AI_PROVIDER not defined. Define between "xai" or "ollama"')

const aiStrategy: Record<string, () => IAIClient> = {
    'xai':      () => new xAIClient(),
    'ollama':   () => new OllamaClient()
}

if (!aiStrategy[provider]) throw new Error('Unknown provider defined! Define one between "xai" or "ollama"')

const aiClient = aiStrategy[provider]()

const promptService = new PromptService()
const candidateRepository = new CandidateRepositoryImpl()
const jobPostingRepository = new JobPostingRepositoryImpl()
const candidacyRepository = new CandidacyRepositoryImpl()

const postulationOrchestrator = new PostulationOrchestrator(aiClient, aiClient, promptService, candidateRepository, jobPostingRepository, candidacyRepository)

export async function initWorkersAndSchedulers() {
    console.info('[BullMQ] - Initiating Queues and Workers...')
    
    console.info('[BullMQ] - Initiating ProcessJobApplication Worker')
    await ProcessJobApplicationWorker(postulationOrchestrator)
    console.info('[BullMQ] - Initiated ProcessJobApplication Worker successfully')

    console.info('[BullMQ] - Initialized Queues and Workers successfully!')
}

initWorkersAndSchedulers()