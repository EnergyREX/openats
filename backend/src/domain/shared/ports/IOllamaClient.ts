export interface IOllamaClient {
    models(): Promise<string[]>
    generate(params: OllamaParams): Promise<string>
}