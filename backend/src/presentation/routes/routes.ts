import { FastifyInstance, FastifyPluginAsync } from "fastify"
import fp from 'fastify-plugin'

import health from "./v1/health.ts"
import auth from "./v1/auth.ts"
import offers from "./v1/offers.ts"
import dashboard from "./v1/dashboard.ts"
import candidacies from "./v1/candidacies.ts"
import candidates from "./v1/candidates.ts"
import users from "./v1/users.ts"
import roles from "./v1/roles.ts"

const routes: FastifyPluginAsync = async (fastify: FastifyInstance) => {;
  await fastify.register(health, { prefix: '/api/v1/' })
  await fastify.register(auth, { prefix: '/api/v1/' })
  await fastify.register(offers, { prefix: '/api/v1/' })
  await fastify.register(dashboard, { prefix: '/api/v1/' })
  await fastify.register(candidacies, { prefix: '/api/v1/' })
  await fastify.register(candidates, { prefix: '/api/v1/' })
  await fastify.register(users, { prefix: '/api/v1/' })
  await fastify.register(roles, { prefix: '/api/v1' })
}

export default fp(routes)
