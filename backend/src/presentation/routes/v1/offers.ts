import { randomUUID } from "node:crypto";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";
import { CreateJobPostingParams } from "src/presentation/types/request/CreateJobPostingParams.js";
import { parseMultipartForm } from "src/infrastructure/services/parseMultipartForm.ts";
import { storeFile } from "src/infrastructure/services/storeFile.ts";
import { postulationData } from "src/application/cv/types/postulationData.js";
import { OfferReturnType } from "src/application/offers/types/OfferReturnType.js";
import { jwtData } from "src/config/types/jwtData.js";

// Forma completa para el backoffice: incluye contactDetails y aplana el Set de
// `requirements` a un array (un Set se serializa a `{}` en JSON).
function toBackofficeOffer(offer: OfferReturnType) {
    return {
        uuid: offer.uuid,
        ownerUuid: offer.ownerUuid,
        title: offer.title,
        body: offer.body,
        company: offer.company,
        location: offer.location,
        salary: offer.salary,
        contactDetails: offer.contactDetails,
        requirements: [...offer.requirements],
    }
}

// Forma pública de una oferta: sin contactDetails y con `requirements` como
// array (un Set se serializa a `{}` en JSON).
function toPublicOffer(offer: OfferReturnType) {
    return {
        uuid: offer.uuid,
        title: offer.title,
        body: offer.body,
        company: offer.company.name
            ? { name: offer.company.name, industry: offer.company.industry }
            : null,
        location: offer.location.city || offer.location.country
            ? offer.location
            : null,
        salary: offer.salary.min || offer.salary.max
            ? { min: offer.salary.min, max: offer.salary.max, currency: offer.salary.currency, period: offer.salary.period }
            : null,
        requirements: [...offer.requirements],
    }
}

export default async function (fastify: FastifyInstance) {
    fastify.post('/offers', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:write')],
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        // TODO: Cache of offers when serving, instead of persistance
        const body = req.body as CreateJobPostingParams

        if (!body?.title || !body?.body) {
            return reply.code(400).send({ ok: false, error: { message: 'Title and body are required' } })
        }

        if (!body.company?.name || !body.location?.city && !body.location?.country || !body.salary) {
            return reply.code(400).send({ ok: false, error: { message: 'Company, location and salary are required' } })
        }

        const result = await container.offer.createJobPosting({
            uuid: randomUUID(),
            ownerUuid: (req.user as jwtData).uuid,
            title: body.title,
            body: body.body,
            company: {
                name: body.company.name,
                size: body.company.size ?? "",
                website: body.company.website ?? "",
                industry: body.company.industry ?? ""
            },
            location: {
                city: body.location.city ?? "",
                country: body.location.country ?? "",
                modality: body.location.modality ?? ""
            },
            salary: {
                min: Number(body.salary.min) || 0,
                max: Number(body.salary.max) || 0,
                currency: body.salary.currency ?? "",
                period: body.salary.period ?? "",
                equity: Boolean(body.salary.equity)
            },
            contactDetails: {
                phoneNumber: body.contactDetails?.phoneNumber ?? "",
                address: body.contactDetails?.address ?? "",
                email: body.contactDetails?.email ?? "",
                website: body.contactDetails?.website ?? "",
                github: body.contactDetails?.github ?? "",
                linkedin: body.contactDetails?.linkedin ?? ""
            },
            requirements: new Set(body.requirements ?? [])
        })

        if (!result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(201).send({ ok: true })
    })

    // Listado para el backoffice. Cada oferta expone su `ownerUuid` (el reclutador
    // asignado a dirigirla); el front resuelve el nombre desde /users si lo necesita.
    fastify.get('/offers', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:read')],
        schema: {
            summary: "Lists job postings for the backoffice.",
            tags: ["Offers"]
        }
    }, async (_req: FastifyRequest, reply: FastifyReply) => {
        const result = await container.offer.getJobPostings()

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        // Resolvemos el nombre de cada reclutador una sola vez (los offers suelen
        // compartir owner), evitando lookups duplicados.
        const recruiterNames = new Map<string, string | null>()
        for (const ownerUuid of new Set(result.value.map(o => o.ownerUuid))) {
            const user = await container.auth.me({ uuid: ownerUuid })
            recruiterNames.set(ownerUuid, user.ok ? user.value.name : null)
        }

        const offers = await Promise.all(result.value.map(async offer => {
            const candidaciesResult = await container.candidacy.getByOffer(offer.uuid)
            const candidacies = candidaciesResult.ok ? candidaciesResult.value : []
            const countBy = (status: string) => candidacies.filter(c => c.getStatus() === status).length

            return {
                uuid: offer.uuid,
                title: offer.title,
                ownerUuid: offer.ownerUuid,
                recruiterName: recruiterNames.get(offer.ownerUuid) ?? null,
                company: { name: offer.company.name, industry: offer.company.industry },
                location: { city: offer.location.city, country: offer.location.country, modality: offer.location.modality },
                applicationCount: candidacies.length,
                pipeline: {
                    sourced: countBy('applied'),
                    screening: countBy('screening'),
                    interviewing: countBy('interviewing'),
                    offer: countBy('offer'),
                    hired: countBy('hired'),
                },
            }
        }))

        return reply.code(200).send({ offers })
    })

    // Detalle completo de una oferta para el backoffice.
    fastify.get('/offers/:uuid', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:read')],
        schema: {
            summary: "Retrieves a single job posting by its uuid for the backoffice.",
            tags: ["Offers"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.offer.getJobPostingByUUID(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send(toBackofficeOffer(result.value))
    })

    // Reasigna la oferta a otro reclutador (quién está asignado a dirigirla).
    fastify.post('/offers/:uuid/assign', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:write')],
        schema: {
            summary: "Reassigns the recruiter in charge of a job posting.",
            tags: ["Offers"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const { recruiterUuid } = (req.body ?? {}) as { recruiterUuid?: string }

        if (!recruiterUuid) {
            return reply.code(400).send({ ok: false, error: { message: 'recruiterUuid is required' } })
        }

        const result = await container.offer.assignJobPosting(uuid, recruiterUuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 400
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })

    fastify.get('/public/offers', {}, async (_req: FastifyRequest, reply: FastifyReply) => {
        const result = await container.offer.getJobPostings()

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ offers: result.value.map(toPublicOffer) })
    })

    fastify.get('/public/offers/:uuid', {}, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.offer.getJobPostingByUUID(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send(toPublicOffer(result.value))
    })

    fastify.post('/offers/:uuid/publish', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:write')],
        schema: {
            summary: "Publishes a draft job posting so it becomes publicly visible.",
            tags: ["Offers"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.offer.publishJobPosting(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send({ ok: true })
    })

    fastify.delete('/offers/:uuid', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:write')],
        schema: {
            summary: "Deletes a job posting by its uuid.",
            tags: ["Offers"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.offer.deleteJobPosting(uuid)

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        return reply.code(204).send()
    })

    fastify.get('/ai/models', {}, async (_request: FastifyRequest, reply: FastifyReply) => {
        return reply.code(200).send(await container.offer.models())
    })

    fastify.post('/postulation/:uuid', {
        preHandler: [fastify.rateLimit({ max: 3, timeWindow: '20 minutes' })],
    },
    async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid: jobPostingUUID } = req.params as { uuid: string };
        const { fields, file } = await parseMultipartForm(req);

        if (!file) {
            return reply.code(400).send('No file was sent.');
        }

        const buffer = await file.toBuffer();
        const filePath = await storeFile(buffer, file.filename)

        const params: postulationData = {
            jobPostingUUID,
            filePath: filePath,
            name: fields.name,
            email: fields.email.toLowerCase(),
            phoneNum: fields.phoneNum,
            website: fields.website?.toLowerCase(),
        };

        const result = await container.offer.postulation(params);

        if (!result.ok) {
        return reply.code(500).send({ ok: false, error: { message: result.error.message, code: result.error.code } });
        }

        reply.code(202).send({ ok: true });
    }
    );
}
