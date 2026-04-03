import { FastifyInstance, FastifyPluginAsync } from "fastify"
import fp from 'fastify-plugin'

import health from "./v1/health.ts"
import auth from "./v1/auth.ts"
import offers from "./v1/offers.ts"

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {;
  await fastify.register(health, { prefix: '/api/v1/' })
  await fastify.register(auth, { prefix: '/api/v1/' })
  await fastify.register(offers, { prefix: '/api/v1/' })
}

export default fp(routes)
