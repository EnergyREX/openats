import fp from 'fastify-plugin';
import multipart from '@fastify/multipart'
import { FastifyPluginAsync } from 'fastify'


const mp: FastifyPluginAsync = async (fastify) => {
    await fastify.register(multipart, {
        limits: {
            fieldNameSize: 255,
            files: 1,
            fileSize: 50 * 1024 * 1024
        }, 
        
    })
}

export default fp(mp)