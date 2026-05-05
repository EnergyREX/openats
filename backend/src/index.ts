import Fastify from 'fastify'

import routes from './presentation/routes/routes.ts'
import plugins from './config/plugins.ts'
import redis from './config/redis.ts'

const API_PORT: number = Number(process.env.API_PORT) || 6500
const fastify = Fastify({
    logger: {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        ignore: 'pid,hostname'
      }
    }
  }
})

await redis.connect()
await fastify.register(plugins)
await fastify.register(routes)

fastify.listen({ port: API_PORT, host: '0.0.0.0' }, function (err) {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
  console.log(`[STATUS] Server running`)
})
