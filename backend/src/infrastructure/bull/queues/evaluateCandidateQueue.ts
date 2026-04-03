import { Queue } from 'bullmq'

export async function candidateEvaluationQueue(name: string) {
    
    const queue = new Queue(name, {
        connection: {
            host: process.env.REDIS_HOST,
            port: parseInt(process.env.REDIS_PORT) || "6385",
            password: process.env.REDIS_PASSWORD
        },
        defaultJobOptions: {
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: { age: 86400 },
            removeOnFail: { age: 6048000 }
        }
    });

    console.info(`[BullMQ] - Queue ${name} initialized`)


}