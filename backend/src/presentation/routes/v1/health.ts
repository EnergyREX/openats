import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { testDBConnection } from "../../../config/database.ts";
import redis from "src/config/redis.ts";
import { MailService } from "src/infrastructure/services/MailService.ts";

const mailService = new MailService()

export default async function (fastify: FastifyInstance) {
    fastify.get('/health/mail', {
        preHandler: [fastify.authenticate, fastify.hasPermission('jobs:read')],
        schema: {
            description: "Verifies the mail transporter connection.",
            tags: ["Status"]
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        const result = await mailService.verify()
        if (!result.ok) {
            reply.code(503)
            return { status: "Mail service unreachable", error: result.error }
        }
        reply.code(200)
        return { status: "Mail service reachable" }
    });

    fastify.get('/health', {
        schema: {
            description: "Returns backend status, if Redis and PostgreSQL are up. ",
            tags: ["Status"]
        }
    }, async (_request: FastifyRequest, reply: FastifyReply) => {
        
        const redisStatus = await redis.ping()
            .then(pong => pong === "PONG" ? 200 : 503)
            .catch(() => 503);

        const postgresStatus = await testDBConnection()
            .then(isConnected => isConnected ? true : false)
            .catch(() => false);

        const isHealthy = redisStatus === 200 && postgresStatus === true;
        const statusCode = isHealthy ? 200 : 503;

        reply.code(statusCode);

        return { 
            status: isHealthy ? "All services up" : "Some service is down",
            server: isHealthy,
            infrastructure: {
                postgres: postgresStatus ? 200 : 503,
                redis: redisStatus
            }
        };
    });
}