import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'
import { FastifyPluginAsync } from 'fastify'

const rateLimits: FastifyPluginAsync = async (fastify) => {
    await fastify.register(rateLimit, {
        global: false,
        max: 10,
        timeWindow: 14400000,
        hook: 'preHandler',
        cache: 10000,
        addHeadersOnExceeding: {
            'x-ratelimit-limit': true,
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true
        },
        addHeaders: {
            'x-ratelimit-remaining': true,
            'x-ratelimit-reset': true,
            'retry-after': true
        }

    })
}

export default fp(rateLimits)