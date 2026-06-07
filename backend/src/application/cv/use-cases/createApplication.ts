import { ApplicationFactory } from "src/domain/offers/factories/Application.factory.ts";
import { IApplicationRepository } from "src/domain/offers/repositories/IApplicationRepository.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { ApplicationSuggestedStatus } from "src/domain/offers/types/ApplicationSuggestedStatus.js";
import { llmEvaluationResponse } from "src/domain/offers/types/llmEvaluationResponse.js";
import { ApplicationAnnotation } from "src/domain/offers/value-objects/ApplicationAnnotation.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { toCommonErrorHandle } from "src/domain/shared/helpers/ToCommonErrorHandle.ts";
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";
import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function createApplication(
    candidateUuid: string, postingUuid: string, 
    candidateRepository: ICandidateRepository, 
    jobPostingRepository: IJobPostingRepository,
    applicationRepository: IApplicationRepository,
    llm: IAIClient, 
    promptService: IPromptService): Promise<Result<void, GenericError>> {
    // Compare with the candidate with the offer.
    
    // Get related data, such as candidate data and offer data.
        const candidate = await candidateRepository.getByUUID(candidateUuid)
        if (!candidate.ok) return Err(candidate.error)

        const posting = await jobPostingRepository.getByUUID(postingUuid)
        if (!posting.ok) return Err(posting.error)

        const today = new Date().toISOString().split('T')[0]
        const prompts = promptService.getEvaluationPrompts()

        const prompt = `Today's Date: ${today}, Candidate: ${candidate.value.toString()}, Posting: ${posting.value.toString()}`

    // Pass through an LLM
        const result = await llm.generate({
        model: process.env.LLM_MODEL || 'qwen2.5:7b',
        system: prompts.system,
        prompt,
        stream: false,
        temperature: 0
    })

    // console.log(`[createApplication] LLM call end: ${new Date().toISOString()}`)
    // console.log(`[createApplication] raw response: ${result}`)

    if (!result) return Err({ message: "Couldn't adapt that image", code: "ERR_OLLAMA_VLM_PARSING" })

    let parsedResponse: llmEvaluationResponse
    try {
        parsedResponse = JSON.parse(result as string)
    } catch {
        return Err({ message: "LLM returned malformed JSON", code: "ERR_LLM_MALFORMED_RESPONSE" })
    }

    if (parsedResponse.score === undefined || parsedResponse.score === null) {
        return Err({ message: "LLM didn't generated any score!", code: "ERR_GENERATE_LLM_SCORE" })
    }

    try {
        const annotations: ApplicationAnnotation[] = parsedResponse.annotations ?? []

        const newApplication = ApplicationFactory.create(
            "",
            postingUuid,
            candidateUuid,
            annotations,
            parsedResponse.suggestedStatus as ApplicationSuggestedStatus,
            parsedResponse.score,
            parsedResponse.discardReason,
            )

        const applicationSubmission = await applicationRepository.save(newApplication)

        if (!applicationSubmission.ok) return Err(applicationSubmission.error)

        return Ok(undefined)
    } catch (err) {
        return Err(toCommonErrorHandle(err, 'ERR_APPLICATION_SUBMISSION'))
    }
}