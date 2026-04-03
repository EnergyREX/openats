import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";

// TODO
export default async function (fastify: FastifyInstance) {
    fastify.post('/candidate/evaluate', 
        { }, 
        async (req: FastifyRequest, reply: FastifyReply) => {
            const data = await req.file()

            if (!data || data == undefined) {
                return reply.code(400).send('No file was sent.')
            }

            const buffer = await data?.toBuffer()
            
            const params = { buffer: buffer, filename: data?.filename }

            const result = await container.offer.evaluate(params)

            if (!result.ok) {
                return { ok: result.ok, error: { message: result.error.message, code: result.error.code } } 
            }

            reply.send({ ok: result.ok, value: result.value })
    })

    fastify.get('/ai/models', {}, async (req: FastifyRequest, reply: FastifyReply) => {
        return reply.code(200).send(await container.offer.models())
    })
}