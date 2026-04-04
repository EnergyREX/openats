import fs from 'node:fs'
import { IPromptService } from 'src/domain/shared/ports/IPromptService.ts';
import { PromptsResponseType } from 'src/domain/shared/types/PromptsResponseType.js';

export class PromptService implements IPromptService {

    private getFilePath(filename: string): string {
        const filePath = `${process.cwd()}/src/infrastructure/ai/prompts/${filename}`
        return filePath
    }

    private collectPrompts(name: string): PromptsResponseType {
        const rawPrompt = fs.readFileSync(this.getFilePath(`/task/${name}.txt`), 'utf8');
        const prompt = rawPrompt
        .trim()
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')

        const rawSysPrompt = fs.readFileSync(this.getFilePath(`/system/${name}.txt`), 'utf-8')
        const sysPrompt = rawSysPrompt
        .trim()
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')

        return { prompt: prompt, system: sysPrompt }
    }

    getParsingPrompts(): PromptsResponseType {
        return this.collectPrompts('parsing') 
    }

    getEvaluationPrompts(): PromptsResponseType {
        return this.collectPrompts('evaluation')
    }
}