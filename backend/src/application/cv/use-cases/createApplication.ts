import { ApplicationFactory } from "src/domain/offers/factories/Application.factory.ts";
import { IApplicationRepository } from "src/domain/offers/repositories/IApplicationRepository.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { llmEvaluationResponse } from "src/domain/offers/types/llmEvaluationResponse.js";
import { ApplicationAnnotation } from "src/domain/offers/value-objects/ApplicationAnnotation.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";
import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { Result } from "src/domain/shared/types/Result.ts";

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
        const posting = await jobPostingRepository.getByUUID(postingUuid)

        if (!candidate.ok) {
            return { ok: false, error: { message: candidate.error.message, code: candidate.error.code } }
        }

        if (!posting.ok) {
            return { ok: false, error: { message: posting.error.message, code: posting.error.code } }
        }

        const today = new Date().toISOString().split('T')[0]
        const prompts = promptService.getEvaluationPrompts()

        const prompt = `Today's Date: ${today}, Candidate: ${candidate.value.toString()}, Posting: ${posting.value.toString()}`
        // console.log(`[createApplication] prompt length: ${prompt.length} chars`)
        // console.log(`[createApplication] LLM call start: ${new Date().toISOString()}`)

    // Pass through an LLM
        const result = await llm.generate({
        model: process.env.LLM_MODEL || 'qwen2.5:7b',
        system: prompts.system,
        prompt,
        stream: false,
        temperature: 0
    })

    // console.log(`[createApplication] LLM call end: ${new Date().toISOString()}`)
    console.log(`[createApplication] raw response: ${result}`)

    if (!result) {
        return { ok: false, error: { message: "Couldn't adapt that image", code: "ERR_OLLAMA_VLM_PARSING" } }
    }

    let parsedResponse: llmEvaluationResponse
    try {
        parsedResponse = JSON.parse(result as string)
    } catch {
        return { ok: false, error: { message: "LLM returned malformed JSON", code: "ERR_LLM_MALFORMED_RESPONSE" } }
    }

    if (parsedResponse.score === undefined || parsedResponse.score === null) {
        return { ok: false,
                 error:
                    {
                        message: "LLM didn't generated any score!",
                        code: "ERR_GENERATE_LLM_SCORE"
                    }
                }
    }

    try {
        const annotations: ApplicationAnnotation[] = parsedResponse.annotations ?? []

        const newApplication = ApplicationFactory.create(
            "",
            postingUuid,
            candidateUuid,
            annotations,
            parsedResponse.suggestedStatus,
            parsedResponse.score,
            parsedResponse.suggestedStatus === "discarded",
            parsedResponse.discardReason)

        const applicationSubmission = await applicationRepository.save(newApplication)

        if (!applicationSubmission.ok) {
            return { ok: false, error: { message: applicationSubmission.error.message, code: applicationSubmission.error.code }}
        }

        return { ok: true, value: undefined }
    } catch (err) {
        if (err instanceof Error) {
            return { ok: false, error: { message: err.message, code: "ERR_APPLICATION_SUBMISSION", cause: `${err.cause}, ${err.stack}` } }
        } else {
            return { ok: false, error: { message: "Couldn't submit the application", code: "ERR_APPLICATION_SUBMISSION" } }
        }
    }
}