import { PromptsResponseType } from "../types/PromptsResponseType.js"

export interface IPromptService {
    getParsingPrompts(): PromptsResponseType
    getEvaluationPrompts(): PromptsResponseType
}