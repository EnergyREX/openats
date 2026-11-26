import { BaseSetting } from "../BaseSetting.ts"

export type AIScoringSettingType = BaseSetting & {
    key: "AI_SCORING",
    value: {
        provider: "openai" | "google" | "xai" | "deepseek" | "ollama",
        key: string,
        model: string
    }
}