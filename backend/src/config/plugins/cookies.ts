import fp from 'fastify-plugin';
import cookie from '@fastify/cookie'
import 'dotenv/config';
import { FastifyPluginAsync } from 'fastify';

const cookies: FastifyPluginAsync = async(fastify) => {
    await fastify.register(cookie, {
        secret: process.env.COOKIE_SECRET_KEY,
        hook: 'preHandler'
    })
}

export default fp(cookies)
