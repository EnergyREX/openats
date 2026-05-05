type AIParams = {
    model: XaiChatModelId | string,
    prompt: string,
    system?: string,
    image?: string,
    stream?: boolean,
    temperature?: number
}