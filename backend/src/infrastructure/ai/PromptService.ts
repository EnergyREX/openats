import fs from 'node:fs'

export class PromptService {

    private getFile(filename: string) {
        const filePath = `${process.cwd()}/src/infrastructure/ai/prompts/${filename}`
        return filePath
    }

    getParsingPrompts() {
        const rawPrompt = fs.readFileSync(this.getFile('/task/parsing.txt'), 'utf8');
        const prompt = rawPrompt
        .trim()
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')

        const rawSysPrompt = fs.readFileSync(this.getFile('/system/parsing.txt'), 'utf-8')
        const sysPrompt = rawSysPrompt
        .trim()
        .replace(/\n+/g, ' ')
        .replace(/\s{2,}/g, ' ')

        return { prompt: prompt, system: sysPrompt }
    }
}