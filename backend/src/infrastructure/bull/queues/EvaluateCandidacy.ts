import { IApplicationQueue } from "src/application/ports/IApplicationQueue.ts";
import { queueProducer } from "../config/queueProducer.ts";
import { Ok, Result } from "src/domain/shared/types/Result.ts";

export const EvaluateCandidacy = queueProducer('EvaluateCandidacy');

export class EvaluateCandidacyQueue implements IApplicationQueue {
    async schedule(data: unknown, delay?: number): Promise<Result<void, never>> {
        // AI evaluation is best-effort: it retries on its own without touching
        // the already-created candidacy. The candidacy stays at score -1 until it lands.
        EvaluateCandidacy.add('EvaluateCandidacy', data, {
            delay,
            attempts: 3,
            backoff: { type: 'exponential', delay: 5000 },
        })
        return Ok(undefined)
    }
}
