// Handler must follow this:
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import fp from 'fastify-plugin'
import { jwtData } from "../types/jwtData.js";
import { RoleCacheImpl } from "src/infrastructure/cache/RoleCacheImpl.ts";

const permissions = async(fastify: FastifyInstance) => {
    const roleCache = new RoleCacheImpl()

    fastify.decorate('hasPermission', (permission: string) => {
        return async (req: FastifyRequest, reply: FastifyReply) => {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader?.startsWith('Bearer ')) {
                return reply.code(401).send({ error: 'Unauthorized'})
            }

            const accessToken = authHeader.slice(7);

            if (!accessToken) return reply.code(401).send({ ok: false, error: { message: "No access token provided", code: "ERR_PREHDL_NO_JWT" } })

            const decodedAccess: jwtData = fastify.jwt.decode(accessToken)
            
            for (const roleUuid of decodedAccess.roles) {                                                                   
                const result = await roleCache.getPermissions(roleUuid)
                if (!result.ok) continue                                                                                    
                            
                const hasPermission = result.value.some(p => p.getName() === permission)                                    
                if (hasPermission) return
            }                                                                                                               
                            
            return reply.code(403).send({ ok: false, error: { message: 'Forbidden', code: 'ERR_PREHDL_FORBIDDEN' } })  
        }
    })
}


export default fp(permissions)
