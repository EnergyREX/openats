type AIParams = {
    model: XaiChatModelId | string,
    prompt: string,
    system?: string,
    image?: string | string[],
    stream?: boolean,
    temperature?: number
}