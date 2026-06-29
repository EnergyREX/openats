import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";

export default async function (fastify: FastifyInstance) {
    fastify.get('/stats', {
        preHandler: [fastify.authenticate],
        schema: {
            summary: "Aggregated counters for the backoffice dashboard.",
            tags: ["Dashboard"]
        }
    }, async (_req: FastifyRequest, reply: FastifyReply) => {
        const result = await container.dashboard.stats()

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(200).send(result.value)
    })
}
