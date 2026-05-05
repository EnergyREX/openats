import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { testDBConnection } from "../../../config/database.ts";
import redis from "src/config/redis.ts";

export default async function (fastify: FastifyInstance) {
    fastify.get('/health', {
        preHandler: [ fastify.hasPermission('jobs:read') ],
        schema: {
            description: "Returns backend status, if Redis and PostgreSQL are up. ",
            tags: ["Status"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        
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