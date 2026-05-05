import { Queue } from 'bullmq'
import { redisConnection } from './redisConnection.ts'

export function queueProducer(name: string) {
    return new Queue(name, {
        connection: redisConnection,
    })
}