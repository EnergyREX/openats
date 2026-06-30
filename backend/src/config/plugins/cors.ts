import fp from 'fastify-plugin'
import fastifyCors from '@fastify/cors'
import { FastifyPluginAsync } from 'fastify'

const cors: FastifyPluginAsync = async (fastify) => {
    const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
        .split(',')
        .map((origin) => origin.trim())

    await fastify.register(fastifyCors, {
        origin: allowedOrigins,
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        preflightContinue: false,
        optionsSuccessStatus: 204
    })
}
export default fp(cors)