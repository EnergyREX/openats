import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'
import { FastifyPluginAsync } from 'fastify'

const documentation: FastifyPluginAsync = async(fastify) => {
    await fastify.register(swagger, {
        openapi: {
            info: {
                title: 'OpenATS API Docs',
                description: 'API Docs for OpenATS',
                version: '0.1.1'
            }
        }
    })

    await fastify.register(swaggerUI, {
    routePrefix: '/documentation',
    uiConfig: {
        docExpansion: 'list',
        deepLinking: false
    },
    uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
    transformSpecificationClone: true
    })
}

export default fp(documentation)
