type OllamaParams = {
    model: string,
    prompt: string,
    system?: string,
    images?: string[],
    stream?: boolean
}