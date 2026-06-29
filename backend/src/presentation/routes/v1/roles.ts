import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";

export default async function (fastify: FastifyInstance) {
    fastify.get('/roles', {
        preHandler: [fastify.authenticate, fastify.hasPermission('roles:read')],
        schema: {
            summary: "Registers an user by given parameters and sends an email to its email.",
            tags: ["Auth"]
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        try {
            const result = await container.auth.allRoles()
            if (result.ok) {
                reply.code(200).send(result)
            } else {
                reply.code(400).send(result.error.message)
            }
        } catch (err) {
            reply.code(400).send(err)
        }
    });
    fastify.get('/roles/:uuid', {
        // TODO: Write a way to verify request users' uuid.
        preHandler: [fastify.authenticate, fastify.hasPermission('roles:read')],
        schema: {
            summary: "Registers an user by given parameters and sends an email to its email.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = request.query as { uuid: string }

        try {
            const result = await container.auth.userRoles({ uuid })
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