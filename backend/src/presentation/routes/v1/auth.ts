import { FastifyInstance, FastifyPluginOptions, FastifyReply, FastifyRequest } from "fastify";
import container from "../../../bootstrap/bootstrap.ts";
import { VerifyRequest } from "../../types/request/VerifyRequest.ts";
import { RegisterRequest } from "../../types/request/RegisterRequest.ts";
import { LoginRequest } from "../../types/request/LoginRequest.ts";
import { RefreshRequest } from "../../types/request/RefreshRequest.ts";
import { LogoutRequest } from "../../types/request/LogoutRequest.ts"

export default async function (fastify: FastifyInstance, opts: FastifyPluginOptions) {
    fastify.post('/register', {
        preHandler: [fastify.authenticate, fastify.hasPermission('users:write')],
        schema: {
            summary: "Registers an user by given parameters and sends an email to its email.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { name, email, password } = request.body as RegisterRequest

        try {
            const result = await container.auth.register({ name, email, password })
            if (result.ok) {
                reply.code(200).send("User registred successfully! Check your email!")
            } else {
                reply.code(400).send(result.error.message)
            }
        } catch (err) {
            reply.code(400).send(err)
        }
    });

    fastify.post('/login', {
        preHandler: [fastify.rateLimit({ max: 10, timeWindow: '20 minutes' })],
        schema: {
            description: "Allows to use the API. Sends two JWT cookies, a refresh one and an access one.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        // TODO: Add a feature to allow user to "remember account". If false -> doesn't send to the user the httpOnly cookie.
        const { email, password } = request.body as LoginRequest

        try {
            const result = await container.auth.login({ email, password, fastify })

            // Set cookie
            if (result.ok) {
                reply.setCookie('refreshToken', result.value.tokens.refreshToken, {
                    path: '/',
                    secure: true,
                    httpOnly: true,
                    sameSite: true
                })
            // Return response with token for next storing.    
                reply.code(200).send({ 
                    success: true,
                    message: "Logged in successfully!",
                    token: result.value.tokens.accessToken,
                    data: {
                        uuid: result.value.uuid,
                        email: result.value.email,
                    }
                })
            } else {
                reply.code(400).send({
                    success: result.ok,
                    error: result.error
                })
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            reply.code(400).send({ success: false, error: { message } })
        }
    });

    fastify.post('/refresh', {
        preHandler: [fastify.rateLimit({ max: 10, timeWindow: '20 minutes' })],
        schema: {
            summary: "Allows to refresh a token to the user if needed.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { refreshToken } = request.cookies as RefreshRequest
        const cookie = refreshToken

        try {
            const result = await container.auth.refresh({ cookie, fastify })
            if (result.ok) {
                reply.setCookie('refreshToken', result.value.refreshToken, {
                    path: '/',
                    secure: true,
                    httpOnly: true,
                    sameSite: true
                })
                reply.code(200).send({ success: true, token: result.value.accessToken })
            } else {
                reply.code(400).send({ success: false, error: result.error })
            }
        } catch (err) {
            reply.code(400).send(err)
        }
    });

    fastify.post('/logout', {
        preHandler: [fastify.rateLimit({ max: 10, timeWindow: '20 minutes' })],
        schema: {
            description: "Allows to log out users.",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { refreshToken } = request.cookies as LogoutRequest
        const cookie = refreshToken

        try {
            const result = await container.auth.logout({ cookie, fastify })

            if (result.ok) {
                reply.clearCookie('refreshToken')
                reply.code(200).send({ success: result.ok, message: "Logged out successfully" })
            } else {
                reply.code(400).send({ success: result.ok, error: result.error })
            }
        } catch (err) {
            reply.code(400).send(err)
        }
    });

    fastify.post('/verify', {
        schema: {
            description: "Allow registred users to use an URL to verify their accounts",
            tags: ["Auth"]
        }
    }, async (request: FastifyRequest, reply: FastifyReply) => {
        const { code } = request.query as VerifyRequest

        const verificationCode = code

        console.log(code)

        const result = await container.auth.verify({ code: verificationCode })

        if (result.ok) {
            reply.code(200).send("User verified successfully!")
        } else {
            reply.code(400).send(result)
        }
    });
}