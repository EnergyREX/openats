import "fastify";
import { FastifyRequest, FastifyReply } from "fastify";

declare module 'fastify' {
    interface FastifyInstance {
        authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>,
        hasPermission: (permission: string) => (request: FastifyRequest, reply: FastifyReply) => Promise<void> 
    }
}