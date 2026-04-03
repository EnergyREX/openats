import { Result } from "../shared/types/Result.ts";

export interface IAIvlClient {
    models(): Promise<string[]>
    generate(params: OllamaParams): Promise<string>
}