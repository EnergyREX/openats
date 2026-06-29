import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";

export default async function (fastify: FastifyInstance) {
    // TODO: write a way to only allow admins and same user to read this.
    fastify.get('/me', {
        preHandler: [fastify.authenticate, fastify.hasPermission('users:read')],
        schema: {
            summary: "Registers an user by given parameters and sends an email to its email.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = request.body as { uuid: string }

        try {
            const result = await container.auth.me({ uuid })
            if (result.ok) {
                reply.code(200).send(result)
            } else {
                reply.code(400).send(result.error.message)
            }
        } catch (err) {
            reply.code(400).send(err)
        }
    });
}