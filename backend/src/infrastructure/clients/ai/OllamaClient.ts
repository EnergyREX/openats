import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";
import { HttpClient } from "../HttpClient.ts";

export class OllamaClient extends HttpClient implements IAIClient {
    
    constructor() {
        super('http://localhost:11434', {})
    }

    async models(): Promise<unknown> {
        const models = await this.get<unknown>('api/tags')
        return models
    }

    async generate(params: AIParams): Promise<string> {
        const { response } = await this.post<OllamaGenerateResponse>('api/generate', { 
            model: params.model, 
            system: params.system,
            prompt: params.prompt,
            images: [params.image],
            stream: params.stream,
            temperature: params.temperature
        })

        return response
    }
}