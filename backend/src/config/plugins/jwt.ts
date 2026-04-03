import 'dotenv/config';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt'
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';

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
      } catch (err) {
        if (err instanceof Error) {
          reply.code(401).send({ ok: false, message: 'Unauthorized' })
        } else {
          reply.code(400).send({ ok: false, message: "Unknown error" })
        }
      }
  })

}

export default fp(auth)
