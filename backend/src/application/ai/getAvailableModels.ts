import { IAIClient } from "src/domain/shared/ports/IAIClient.ts";

export async function getAvailableModels(client: IAIClient) {
    try {
        const models = await client.models()
        return { ok: true, value: models }
    } catch (err) {
        if (err instanceof Error) {
            return { ok: false, error: { message: err.message, code: "ERR_APP_GET_MODELS", cause: err.cause } }
        } else {
            return { ok: false, error: { message: 'Unknown error', code: "ERR_APP_GET_MODELS" }}
        }
    }
}