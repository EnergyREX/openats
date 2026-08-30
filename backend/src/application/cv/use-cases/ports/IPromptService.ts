import { PromptsResponseType } from "src/domain/shared/types/PromptsResponseType.js"

export interface IPromptService {
    getParsingPrompts(): PromptsResponseType
    getEvaluationPrompts(): PromptsResponseType
}