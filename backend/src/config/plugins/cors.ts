import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'

const cors: FastifyPluginAsync = async (fastify) => {
    await fastify.register(fastifyCors, {
        origin: 'http://localhost:3000',
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        preflightContinue: false,
        optionsSuccessStatus: 204
    })
}

export default fp(cors)
