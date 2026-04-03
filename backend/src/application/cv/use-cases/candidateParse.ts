import { OllamaClient } from "src/infrastructure/clients/ollama/OllamaClient.ts"
import { cvToB64Service } from "../../../infrastructure/services/cvToB64.ts"
import { PromptService } from "src/infrastructure/ai/PromptService.ts"

// This function parses a CV to create a new Candidate and after a new application.
export async function candidateParse(buffer: Buffer, filename: string) {
    // Await receiving a CV.
    const service = new cvToB64Service()
    const promptService = new PromptService()

    const prompt = promptService.getParsingPrompts()
    
    // Parse the CV to create a new Candidate in db.
    const adaptedImage = await service.exec(buffer, filename)

    if (!adaptedImage.ok) {
        return { ok: false, error: { message: adaptedImage.error.message, code: adaptedImage.error.code } }
    }

    const vlm = new OllamaClient()
    const result = await vlm.generate({
        model: process.env.VL_MODEL || 'qwen2.5vl:7b',
        system: prompt.system,
        prompt: prompt.prompt,
        images: [adaptedImage.value],
        stream: false
    })

    if (!result) {
        return { ok: false, error: { message: "Couldn't adapt that image", code: "ERR_OLLAMA_VLM_PARSING" } }
    }

    try {
        const raw = result.response as string
        const parsed = JSON.parse(raw)
        return { ok: true, value: parsed }
    } catch (err) {
        if (err instanceof Error) {
            return { ok: false, error: { message: err.message, code: "ERR_CV_CANT_PARSE" } }
        } else {
            return { ok: false, error: { message: "Unknown error", code: "ERR_CV_CANT_PARSE" } }
        }
    }
    // After creating the Candidate, a new queue begins to run to create (and submit the application)
    
}