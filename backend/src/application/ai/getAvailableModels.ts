import { OllamaClient } from "src/infrastructure/clients/ollama/OllamaClient.ts";

export async function getAvailableModels() {
    try {
        const client = new OllamaClient()
        return { ok: true, value: await client.models() }
    } catch (err) {
        if (err instanceof Error) {
            return { ok: false, error: { message: err.message, code: "ERR_APP_GET_MODELS", cause: err.cause } }
        } else {
            return { ok: false, error: { message: 'Unknown error', code: "ERR_APP_GET_MODELS" }}
        }
    }
}