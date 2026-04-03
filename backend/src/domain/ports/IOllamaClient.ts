import { Result } from "../shared/types/Result.ts";

export interface IOllamaClient {
    models(): Promise<string[]>
    generate(): Promise<string>
}