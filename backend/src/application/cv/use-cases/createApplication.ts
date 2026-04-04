import { ApplicationFactory } from "src/domain/offers/factories/Application.factory.ts";
import { IApplicationRepository } from "src/domain/offers/repositories/IApplicationRepository.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { llmEvaluationResponse } from "src/domain/offers/types/llmEvaluationResponse.js";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { IOllamaClient } from "src/domain/shared/ports/IOllamaClient.ts";
import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { Result } from "src/domain/shared/types/Result.ts";

export async function createApplication(
    candidateUuid: string, postingUuid: string, 
    candidateRepository: ICandidateRepository, 
    jobPostingRepository: IJobPostingRepository,
    applicationRepository: IApplicationRepository,
    llm: IOllamaClient, promptService: IPromptService): Promise<Result<void, GenericError>> {
    // Compare with the candidate with the offer.
    
    // Get related data, such as candidate data and offer data.
        const candidate = await candidateRepository.getByUUID(candidateUuid)
        const posting = await jobPostingRepository.getByUUID(postingUuid)

        const prompts = promptService.getEvaluationPrompts()
    // Pass through LLM
        const result = await llm.generate({
        model: process.env.VL_MODEL || 'qwen2.5vl:7b',
        system: prompts.system,
        prompt: `Candidate: ${candidate}, Posting: ${posting}`,
        stream: false
    })

    const parsedResponse: llmEvaluationResponse = JSON.parse(result)

    if (!parsedResponse.score) {
        return { ok: false, 
                 error: 
                    { 
                        message: "LLM didn't generated any score!", 
                        code: "ERR_GENERATE_LLM_SCORE" 
                    } 
                }

    }
    
        const newApplication = await ApplicationFactory.create(
            crypto.randomUUID(), 
            postingUuid, 
            candidateUuid,
            parsedResponse.score,
            parsedResponse?.annotations,
            true)
    
        applicationRepository.save(newApplication)

        return { ok: true, value: undefined }
}