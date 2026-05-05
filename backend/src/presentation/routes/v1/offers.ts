import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";
import { CreateJobPostingParams } from "src/application/cv/use-cases/createJobPosting.ts";
import { parseMultipartForm } from "src/infrastructure/services/parseMultipartForm.ts";
import { storeFile } from "src/infrastructure/services/storeFile.ts";
import { postulationData } from "src/application/cv/types/postulationData.js";

export default async function (fastify: FastifyInstance) {
    fastify.post('/offers', {}, async (req: FastifyRequest, reply: FastifyReply) => {
        // TODO: Cache of offers when serving, instead of persistance
        const { title, body, contactDetails, requirements } = req.body as CreateJobPostingParams

        if (!title || !body) {
            return reply.code(400).send({ ok: false, error: { message: 'Title and body are required' } })
        }

        const result = await container.offer.createJobPosting({ title, body, contactDetails, requirements })

        if (!result.ok) {
            return reply.code(400).send({ ok: false, error: result.error })
        }

        return reply.code(201).send({ ok: true, value: result.value })
    })

    fastify.get('/ai/models', {}, async (req: FastifyRequest, reply: FastifyReply) => {
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