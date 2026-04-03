import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import { testDBConnection } from "../../../config/database.ts";

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.get('/health', {
        schema: {
            description: "Returns backend status, if Redis and PostgreSQL are up. ",
            tags: ["Status"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        
        /*
        const redisStatus = await fastify.redis.ping()
            .then(pong => pong === "PONG" ? 200 : 503)
            .catch(() => 503);
        */

        const postgresStatus = await testDBConnection()
            .then(isConnected => isConnected ? true : false)
            .catch(() => false);

        // const isHealthy = redisStatus === 200 && postgresStatus === true;
        const isHealthy = postgresStatus === true
        const statusCode = isHealthy ? 200 : 503;

        reply.code(statusCode);

        return { 
            status: isHealthy ? "All services up" : "Some service is down",
            server: 200,
            infrastructure: {
                postgres: postgresStatus ? 200 : 503,
                // redis: redisStatus
            }
        };
    });
}