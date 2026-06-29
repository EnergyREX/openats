// Contrato de salida del motor de matching (LLM). Sólo datos estructurados de
// cobertura/evidencia; el score se calcula en el backend a partir de esto.
export type llmMatchingResponse = {
    matched_skills: string[]
    missing_skills: string[]
    nice_to_have_matched: string[]
    experience_matches: string[]
    education_matches: string[]
    language_matches: string[]
    coverage: {
        required_skills: { matched: number, total: number }
        nice_to_have: { matched: number, total: number }
    }
    evidence: {
        field: string
        value: string
        source: "candidate" | "job"
    }[]
    signals: {
        type: "neutral"
        body: string
    }[]
}
