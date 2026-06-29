import { llmMatchingResponse } from "../types/llmMatchingResponse.js"
import { CandidacyAnnotation } from "../value-objects/CandidacyAnnotation.ts"

// Pesos del score. El matching del LLM sólo aporta ratios fiables para skills
// (coverage required/nice-to-have); experiencia/educación/idiomas no traen "total",
// así que sólo contribuyen por presencia (señal contextual acotada).
const WEIGHTS = {
    requiredSkills: 0.70,
    niceToHave: 0.15,
    context: 0.15, // repartido entre experiencia, educación e idiomas
} as const

function clamp01(n: number): number {
    return Math.min(Math.max(n, 0), 1)
}

// Cobertura de requisitos obligatorios: sin requisitos definidos no se penaliza
// (ratio neutro 1, no puedes fallar lo que no se pide).
function requiredRatio(matched: number, total: number): number {
    if (total <= 0) return 1
    return clamp01(matched / total)
}

// Cobertura de "nice-to-have": es un bonus; sin nice-to-have definidos no hay
// bonus que otorgar (0), a diferencia de los obligatorios.
function niceRatio(matched: number, total: number): number {
    if (total <= 0) return 0
    return clamp01(matched / total)
}

/**
 * Convierte la cobertura del matching en un score entero 0–100.
 *
 * - Skills requeridas: peso dominante (matched/total).
 * - Nice-to-have: peso menor (matched/total).
 * - Contexto (experiencia, educación, idiomas): sólo presencia, repartida.
 */
export function scoreMatching(m: llmMatchingResponse): number {
    const required = m.coverage?.required_skills ?? { matched: 0, total: 0 }
    const nice = m.coverage?.nice_to_have ?? { matched: 0, total: 0 }

    const requiredScore = WEIGHTS.requiredSkills * requiredRatio(required.matched, required.total)
    const niceScore = WEIGHTS.niceToHave * niceRatio(nice.matched, nice.total)

    const contextHits =
        (m.experience_matches?.length ? 1 : 0) +
        (m.education_matches?.length ? 1 : 0) +
        (m.language_matches?.length ? 1 : 0)
    const contextScore = WEIGHTS.context * (contextHits / 3)

    const score = (requiredScore + niceScore + contextScore) * 100
    return Math.round(Math.min(Math.max(score, 0), 100))
}

/**
 * Construye las anotaciones de la candidatura a partir del matching:
 * skills presentes (positive), requisitos no encontrados (negative) y señales (neutral).
 */
export function buildMatchingAnnotations(m: llmMatchingResponse): CandidacyAnnotation[] {
    return [
        ...(m.matched_skills ?? []).map((s): CandidacyAnnotation => ({ type: "positive", body: `Skill presente: ${s}` })),
        ...(m.missing_skills ?? []).map((s): CandidacyAnnotation => ({ type: "negative", body: `Requisito no encontrado: ${s}` })),
        ...(m.signals ?? []).map((s): CandidacyAnnotation => ({ type: "neutral", body: s.body })),
    ]
}
