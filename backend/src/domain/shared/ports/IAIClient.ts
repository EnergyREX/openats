export interface IAIClient {
    models(): Promise<unknown>
    generate(params: AIParams): Promise<unknown>
}