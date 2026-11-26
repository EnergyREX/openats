import { BaseSetting } from "../BaseSetting.ts";

export type AIParsingSettingType = BaseSetting & {
    key: "AI_PARSING",
    value: {
        provider: "openai" | "google" | "xai" | "deepseek" | "ollama",
        key: string,
        model: string
    }
}