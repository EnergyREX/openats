import { Worker } from "bullmq";
import { PostulationOrchestrator } from "src/application/cv/use-cases/PostulationOrchestrator.ts";
import { redisConnection } from "../../config/redisConnection.ts";

export function ProcessJobApplicationWorker(postulationOrchestrator: PostulationOrchestrator) {
    const worker = new Worker('ProcessJobApplication',
        async (job) => {
            const data = await job.data
            const result = await postulationOrchestrator.exec(data)
            return result
        },
        {
            connection: redisConnection
        }
    )

    worker.on('active', (job) => {
        console.log(`[BullMQ] - initiated candidate parsing job ${job.name}.`)
    })

    worker.on('completed', (job) => {
        console.log(`[BullMQ] - completed candidate parsing job ${job.name} successfully.`)
    })

    worker.on('failed', (job) => {
        console.log(`[BullMQ] - completed candidate parsing job ${job!.name} failed.`)
    })
}