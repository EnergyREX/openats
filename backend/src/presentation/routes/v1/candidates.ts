import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import container from "src/bootstrap/bootstrap.ts";
import { Candidate } from "src/domain/offers/aggregates/Candidate.ts";

// Directorio donde `storeFile` deja los CVs subidos. Se usa para evitar que un
// `cv_url` manipulado escape de la carpeta de almacenamiento (path traversal).
const STORAGE_DIR = path.resolve(`${process.cwd()}/src/infrastructure/storage`)

const CONTENT_TYPES: Record<string, string> = {
    ".pdf": "application/pdf",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
}

// `storeFile` guarda como `<timestamp>-<nombreOriginal>`; quitamos el prefijo
// para que la descarga conserve un nombre legible.
function downloadName(filePath: string): string {
    return path.basename(filePath).replace(/^\d+-/, "")
}

// Perfil completo del candidato para el backoffice. Se aplana desde los getters
// (no desde `Candidate.toJson()`, que serializa los arrays con `.toString()`).
function toCandidateProfile(c: Candidate) {
    const contact = c.getContactDetails()
    return {
        uuid: c.getUuid(),
        name: c.getName(),
        title: c.getTitle(),
        about: c.getAbout(),
        contactDetails: {
            email: contact.getEmail() ?? null,
            phoneNumber: contact.getPhoneNumber() ?? null,
            address: contact.getAddress() ?? null,
            website: contact.getWebsite() ?? null,
            github: contact.getGithub() ?? null,
            linkedin: contact.getLinkedin() ?? null,
        },
        skills: c.getSkills(),
        experience: c.getExperience() ?? [],
        projects: c.getProjects() ?? [],
        education: c.getEducation() ?? [],
        certifications: c.getCertifications() ?? [],
        languages: c.getLanguages() ?? [],
        volunteering: c.getVolunteering() ?? null,
        additionalInfo: c.getAdditionalInfo() ?? null,
        cvUrl: c.getCvPath() || null,
    }
}

export default async function (fastify: FastifyInstance) {
    // TEMPORAL: applicationCount/topScore/topStatus dependen de las candidacies y aún
    // no se agregan aquí; se devuelven como 0/null hasta que exista ese cruce.
    fastify.get('/candidates', {
        preHandler: [fastify.authenticate, fastify.hasPermission('candidates:read')],
        schema: {
            summary: "Lists candidates for the backoffice.",
            tags: ["Candidates"]
        }
    }, async (_req: FastifyRequest, reply: FastifyReply) => {
        const result = await container.candidate.getAll()

        if (!result.ok) {
            return reply.code(500).send({ ok: false, error: result.error })
        }

        const candidates = result.value.map(c => ({
            uuid: c.getUuid(),
            name: c.getName(),
            title: c.getTitle(),
            email: c.getContactDetails().getEmail() ?? null,
            skills: c.getSkills(),
            applicationCount: 0,
            topScore: null,
            topStatus: null,
        }))

        return reply.code(200).send({ candidates })
    })

    fastify.get('/candidates/:uuid', {
        preHandler: [fastify.authenticate, fastify.hasPermission('candidates:read')],
        schema: {
            summary: "Retrieves a candidate profile by its uuid.",
            tags: ["Candidates"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidate.getByUuid(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        return reply.code(200).send(toCandidateProfile(result.value))
    })

    // Descarga el CV del candidato. Si `cv_url` es una URL externa, redirige; si
    // es una ruta local (subida vía `storeFile`), transmite el fichero como blob.
    fastify.get('/candidates/:uuid/cv', {
        preHandler: [fastify.authenticate, fastify.hasPermission('candidates:read')],
        schema: {
            summary: "Downloads the candidate's stored CV.",
            tags: ["Candidates"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidate.getByUuid(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        const cvPath = result.value.getCvPath()
        if (!cvPath) {
            return reply.code(404).send({ ok: false, error: { message: 'This candidate has no CV', code: 'ERR_CV_NOT_FOUND' } })
        }

        if (/^https?:\/\//.test(cvPath)) {
            return reply.redirect(cvPath)
        }

        // Defensa frente a path traversal: el fichero debe vivir dentro de STORAGE_DIR.
        const resolved = path.resolve(cvPath)
        if (resolved !== STORAGE_DIR && !resolved.startsWith(`${STORAGE_DIR}${path.sep}`)) {
            return reply.code(403).send({ ok: false, error: { message: 'Invalid CV path', code: 'ERR_CV_FORBIDDEN' } })
        }

        try {
            await stat(resolved)
        } catch {
            return reply.code(404).send({ ok: false, error: { message: 'CV file is missing on disk', code: 'ERR_CV_MISSING' } })
        }

        const filename = downloadName(resolved)
        const contentType = CONTENT_TYPES[path.extname(resolved).toLowerCase()] ?? 'application/octet-stream'

        reply.header('Content-Type', contentType)
        reply.header(
            'Content-Disposition',
            `attachment; filename="${filename.replace(/"/g, '')}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
        )
        return reply.send(createReadStream(resolved))
    })

    fastify.get('/candidates/:uuid/evaluation', {
        preHandler: [fastify.authenticate, fastify.hasPermission('applications:read')],
        schema: {
            summary: "Retrieves the candidacy evaluation tied to a candidate.",
            tags: ["Candidates"]
        }
    }, async (req: FastifyRequest, reply: FastifyReply) => {
        const { uuid } = req.params as { uuid: string }
        const result = await container.candidacy.getCandidateEvaluation(uuid)

        if (!result.ok) {
            const status = result.error.message === 'Not found' ? 404 : 500
            return reply.code(status).send({ ok: false, error: result.error })
        }

        const evaluation = result.value
        return reply.code(200).send({
            uuid: evaluation.getUuid().toPrimitive(),
            offerUuid: evaluation.getOfferUuid().toPrimitive(),
            candidateUuid: evaluation.getCandidateUuid().toPrimitive(),
            status: evaluation.getStatus(),
            score: evaluation.getScore(),
            annotations: evaluation.getAnnotations(),
        })
    })
}
