import { HttpClient } from "../HttpClient.ts";

interface OllamaParams {
    model: string,
    prompt: string,
    system?: string,
    images?: string[],
    stream?: boolean
}

export class OllamaClient extends HttpClient {
    
    constructor() {
        super('http://localhost:11434', {})
    }

    async models() {
        const models = await this.get<unknown>('api/tags')
        return models
    }

    async generate(params: OllamaParams) {
        const result = await this.post<unknown>('api/generate', { 
            model: params.model, 
            system: params.system,
            prompt: params.prompt,
            images: params.images,
            stream: params.stream 
        })
        return result
    }
}