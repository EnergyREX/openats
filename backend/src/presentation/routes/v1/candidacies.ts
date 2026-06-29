import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";
import { Candidacy } from "src/domain/offers/aggregates/Candidacy.ts";

// La Candidacy es un aggregate con getters (sin toJson propio): se aplana aquí,
// resolviendo los value-objects UUID a su primitivo.
function toCandidacyResponse(c: Candidacy) {
    return {
        uuid: c.getUuid().toPrimitive(),
        offerUuid: c.getOfferUuid().toPrimitive(),
        candidateUuid: c.getCandidateUuid().toPrimitive(),
        status: c.getStatus(),
        currentPhaseOrder: c.getCurrentPhaseOrder(),
        score: c.getScore(),
        annotations: c.getAnnotations(),
        rejectionReason: c.getRejectionReason(),
        createdAt: c.getCreationDate(),
        updatedAt: c.getLastUpdateDate(),
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.get('/offers/:uuid/candidacies', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:read')],
        schema: {
            summary: "Lists every candidacy applied to a given offer.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.getByOffer(uuid)

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ candidacies: result.value.map(toCandidacyResponse) })
    })

    fastify.get('/candidacies/:uuid', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:read')],
        schema: {
            summary: "Retrieves a single candidacy by its uuid.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.getByUuid(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send(toCandidacyResponse(result.value))
    })

    // NOTA: los use-cases de mutación (advance/hire/reject/withdraw) sólo devuelven
    // un Err en el camino de fallo; en el camino feliz devuelven undefined. Por eso
    // aquí se trata `result?.ok === false` como error y la ausencia de Err como éxito.
    fastify.post('/candidacies/:uuid/advance', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:write')],
        schema: {
            summary: "Advances a candidacy to the next phase of the offer pipeline.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.advance(uuid)

        if (result && !result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })

    fastify.post('/candidacies/:uuid/hire', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:write')],
        schema: {
            summary: "Marks a candidacy as hired.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.hire(uuid)

        if (result && !result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })

    fastify.post('/candidacies/:uuid/reject', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:write')],
        schema: {
            summary: "Rejects a candidacy with a mandatory reason.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const { reason } = (req.body ?? {}) as { reason?: string }

        if (!reason) {
            return reply.code(400).send({ ok: false, error: { message: 'A reject reason is required', code: 'ERR_PRES_REJECT_REASON' } })
        }

        const result = await container.candidacy.reject(uuid, reason)

        if (result && !result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })

    fastify.post('/candidacies/:uuid/withdraw', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:write')],
        schema: {
            summary: "Withdraws a candidacy from the process.",
            tags: ["Candidacies"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.withdraw(uuid)

        if (result && !result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })
}
