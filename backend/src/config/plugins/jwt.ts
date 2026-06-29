import 'dotenv/config';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { jwtData } from '../types/jwtData.js';

const auth: FastifyPluginAsync = async (fastify) => {
  const secret = process.env.JWT_SECRET_KEY

  if (!secret) { throw new Error('Secret key is not defined!') }

  await fastify.register(jwt, {
    secret: secret
  })

  fastify.decorate('authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify()
        const payload = request.user as jwtData
        if (payload.type !== 'access') {
          return reply.code(401).send({ ok: false, message: 'Unauthorized' })
        }
      } catch {
        return reply.code(401).send({ ok: false, message: 'Unauthorized' })
      }
  })

}

export default fp(auth)
