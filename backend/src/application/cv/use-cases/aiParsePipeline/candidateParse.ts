import { cvToB64Service } from "../../../../infrastructure/services/cvToB64.ts"
import { PromptService } from "src/infrastructure/ai/PromptService.ts"
import { IAIClient } from "src/domain/shared/ports/IAIClient.ts"
import { CandidateFactory } from "src/domain/offers/factories/Candidate.factory.ts"
import { ICandidateRepository } from "src/domain/offers/repositories/ICandidateRepository.ts"
import { getFileByPath } from "src/infrastructure/services/getFileByPath.ts"
import { GenericError } from "src/domain/shared/errors/Generic.error.js"
import { Candidate } from "src/domain/offers/aggregates/Candidate.ts"
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts"
import { toError } from "src/domain/shared/helpers/ToError.ts"

// This function parses a CV to create a new Candidate and after a new application.
export async function candidateParse(filePath: string, vlm: IAIClient, candidateRepository: ICandidateRepository,
                                     data: { name: string, email: string, phoneNum?: string, website?: string }): Promise<Result<Candidate, GenericError>> {
    // Await receiving a CV.
    const service = new cvToB64Service()
    const promptService = new PromptService()
    const filename = filePath.split('/').at(-1)!    

    const prompts = promptService.getParsingPrompts()
    const file = await getFileByPath(filePath)
    
    // Parse the CV to create a new Candidate in db.
    const adaptedImage = await service.exec(file, filename)

    if (!adaptedImage.ok) {
        return Err({ message: adaptedImage.error.message, code: adaptedImage.error.code })
    }
    
    const result = await vlm.generate({
        model: process.env.VL_MODEL || 'qwen2.5vl:7b',
        system: prompts.system,
        prompt: prompts.prompt,
        image: adaptedImage.value,
        stream: false
    })

    if (!result) return Err({ message: "Couldn't adapt that image", code: "ERR_OLLAMA_VLM_PARSING" })

    try {
        const raw = result
        const parsed = JSON.parse(raw as string)

            const candidate = CandidateFactory.create(
                "",
                data.name,
                parsed.title,
                parsed.profile,
                {
                    phoneNumber: data.phoneNum ? data.phoneNum : parsed.contact.phone,
                    email: data.email,
                    address: parsed.contact.location,
                    website: data.website ? data.website : parsed.contact.website,
                    github: parsed.contact.github,
                    linkedin: parsed.contact.linkedin,
                },
                parsed.skills,
                filePath,
                parsed.work_experience,
                parsed.projects,
                parsed.education,
                parsed.certifications ? parsed.certifications : [],
                parsed.languages ? parsed.languages : [],
                parsed.volunteering ? parsed.volunteering : [],
                parsed.additional_info ? parsed.additional_info : []
            )
        
            const saveResult = await candidateRepository.save(candidate)

            if (!saveResult.ok) return Err(saveResult.error)
            
            candidate.setUuid(saveResult.value)

        return Ok(candidate)
    } catch (err) {
        return Err(toError(err, 'ERR_APPLICATION_SUBMISSION'))
    }    
}