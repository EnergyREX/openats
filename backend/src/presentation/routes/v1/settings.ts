import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";
import { toSettingResponse } from "./mappers/toSettingResponse.ts";
import { isSettingKey, settingSchemas } from "./schemas/settingSchemas.ts";

export default async function (fastify: FastifyInstance) {
    fastify.get('/settings', {
        preHandler: [fastify.authenticate, fastify.hasPermission('settings:read')],
        schema: {
            summary: "Get all settings. API keys are never returned",
            tags: ["Settings"]
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        const result = await container.settings.getAll()

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true, value: result.value.map(toSettingResponse) })
    });

    fastify.get('/settings/:key', {
        preHandler: [fastify.authenticate, fastify.hasPermission('settings:read')],
        schema: {
            summary: "Get a setting by its key. API keys are never returned",
            tags: ["Settings"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { key } = request.params as { key: string }

        const result = await container.settings.getOne(key)

        if (!result.ok) {
            const status = result.error.code === 'ERR_SETTING_NOT_FOUND' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true, value: toSettingResponse(result.value) })
    });

    fastify.put('/settings/:key', {
        preHandler: [fastify.authenticate, fastify.hasPermission('settings:write')],
        schema: {
            summary: "Create or replace the value of a setting",
            tags: ["Settings"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { key } = request.params as { key: string }

        if (!isSettingKey(key)) {
            return reply.code(404).send({ ok: false, error: { message: 'Setting not found', code: 'ERR_SETTING_NOT_FOUND' } })
        }

        const parsed = settingSchemas[key].safeParse(request.body)

        if (!parsed.success) {
            return reply.code(400).send({
                ok: false,
                error: {
                    message: 'Invalid setting value',
                    code: 'ERR_SETTING_INVALID',
                    issues: parsed.error.issues.map(({ path, message }) => ({ path, message }))
                }
            })
        }

        const result = await container.settings.update(key, parsed.data)

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(204).send()
    });
}
