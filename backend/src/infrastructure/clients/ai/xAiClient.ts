import { HttpClient } from "../HttpClient.ts";

import { FilePart, generateText, ImagePart, TextPart } from "ai"
import { createXai } from "@ai-sdk/xai";

import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";


export class xAIClient extends HttpClient implements IAIClient {
    
    private xai;

    constructor() {
        const apiKey = process.env.AI_API_KEY
        if (!apiKey) {
            throw new Error("AI_API_KEY is not set. Define it in backend/.env to use the 'xai' provider.")
        }

        super('https://api.x.ai', {
            Authorization: `Bearer ${apiKey}`
        })

        this.xai = createXai({ apiKey })
    }

    async models(): Promise<unknown> {
        const models = await this.get<unknown>('v1/models')
        return models
    }
    
    async generate(params: AIParams): Promise<unknown> {
    
        const promptContent: string | (TextPart | ImagePart | FilePart)[] = [{
            type: "text",
            text: params.prompt
        }]

        if (params.image) {
            const imgContent: ImagePart = {
                type: "image",
                image: Array.isArray(params.image) ? params.image[0] : params.image,
                mediaType: 'image/png'
            }

            promptContent.push(imgContent)
        }

        const { text } = await generateText({
        model: this.xai('grok-4-1-fast-non-reasoning'),
        temperature: params.temperature,
        messages: [
            {
                role: 'system',
                content: params.system || ""
            },
            {
                role: "user",
                content: promptContent
            },    
        ],
        });

        return text
    }
}