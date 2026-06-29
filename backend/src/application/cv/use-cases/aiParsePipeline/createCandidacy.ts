import { Candidacy } from "src/domain/offers/aggregates/Candidacy.ts";
import { ICandidacyRepository } from "src/domain/offers/repositories/ICandidacyRepository.ts";
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts";
import { IJobPostingRepository } from "src/domain/offers/repositories/IJobPostingRepository.ts";
import { llmMatchingResponse } from "src/domain/offers/types/llmMatchingResponse.js";
import { buildMatchingAnnotations, scoreMatching } from "src/domain/offers/services/scoreMatching.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";
import { IPromptService } from "src/domain/shared/ports/IPromptService.ts";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";

export async function createApplication(
    candidateUuid: string, postingUuid: string, 
    candidateRepository: ICandidateRepository, 
    jobPostingRepository: IJobPostingRepository,
    candidacyRepository: ICandidacyRepository,
    llm: IAIClient, 
    promptService: IPromptService): Promise<Result<void, GenericError>> {

    // Create a new Candidacy and store in DB
        const candidacy = Candidacy.create(postingUuid, candidateUuid)
        const storedCandidacy = await candidacyRepository.save(candidacy)
        
        if (!storedCandidacy.ok) return Err(storedCandidacy.error)

    // Get related data, such as candidate data and offer data.
        const candidate = await candidateRepository.getByUUID(candidateUuid)
        if (!candidate.ok) return Err(candidate.error)

        const posting = await jobPostingRepository.getByUUID(postingUuid)
        if (!posting.ok) return Err(posting.error)

        const today = new Date().toISOString().split('T')[0]
        const prompts = promptService.getEvaluationPrompts()

        const prompt = `Today's Date: ${today}, Candidate: ${candidate.value.toString()}, Posting: ${posting.value.toString()}`

        const result = await llm.generate({
        model: process.env.LLM_MODEL || 'qwen2.5:7b',
        system: prompts.system,
        prompt,
        stream: false,
        temperature: 0
    })

    if (!result) return Err({ message: "Couldn't adapt that image", code: "ERR_OLLAMA_VLM_PARSING" })

    let matching: llmMatchingResponse
    try {
        matching = JSON.parse(result as string)
    } catch {
        return Err({ message: "LLM returned malformed JSON", code: "ERR_LLM_MALFORMED_RESPONSE" })
    }

    if (!matching.coverage?.required_skills) {
        return Err({ message: "LLM matching response is missing coverage data", code: "ERR_LLM_MALFORMED_RESPONSE" })
    }

    try {
        // El score ya no lo da el LLM: se calcula en el backend desde la cobertura.
        const score = scoreMatching(matching)
        const annotations = buildMatchingAnnotations(matching)

        candidacy.evaluate(score, annotations)

        const applicationSubmission = await candidacyRepository.update(candidacy)

        if (!applicationSubmission.ok) return Err(applicationSubmission.error)

        return Ok(undefined)
    } catch (err) {
        return Err(toError(err, 'ERR_APPLICATION_SUBMISSION'))
    }
}