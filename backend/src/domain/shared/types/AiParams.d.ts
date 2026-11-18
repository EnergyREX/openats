type AIParams = {
    model: 
        XaiChatModelId | 
        OpenAIResponsesModelId | 
        GoogleModelId | 
        DeepSeekChatModelId | 
        DeepSeekChatModelId | 
        string,
    prompt: string,
    system?: string,
    image?: string | string[],
    stream?: boolean,
    temperature?: number
}