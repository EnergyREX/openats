import { Worker } from "bullmq";
import { redisConnection } from "../../config/redisConnection.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result } from "src/domain/shared/types/Result.ts";

// Decoupled stage 2: evaluation runs as its own retryable job.
// The use-case is injected so this worker stays agnostic of the application layer.
type CandidacyEvaluator = (candidacyUuid: string) => Promise<Result<void, GenericError>>

export function EvaluateCandidacyWorker(evaluateCandidacy: CandidacyEvaluator) {
    const worker = new Worker('EvaluateCandidacy',
        async (job) => {
            const { candidacyUuid } = job.data as { candidacyUuid: string }
            const result = await evaluateCandidacy(candidacyUuid)
            if (!result.ok) throw new Error(`${result.error.code} - ${result.error.message}`)
            return result
        },
        {
            connection: redisConnection
        }
    )

    worker.on('active', (job) => {
        console.log(`[BullMQ] - initiated candidacy evaluation job ${job.name}.`)
    })

    worker.on('completed', (job) => {
        console.log(`[BullMQ] - completed candidacy evaluation job ${job.name} successfully.`)
    })

    worker.on('failed', (job) => {
        console.log(`[BullMQ] - failed candidacy evaluation job ${job!.name}.`)
    })
}
