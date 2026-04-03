import { FastifyInstance } from "fastify"
import { login } from "../../application/auth/use-cases/login.ts"
import { register } from "../../application/auth/use-cases/register.ts"
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImpl.ts"
import { refresh } from "../../application/auth/use-cases/refresh.ts"
import { logout } from "../../application/auth/use-cases/logout.ts"
import { verify } from "../../application/auth/use-cases/verify.ts"

const userRepository = new UserRepositoryImpl()

export const authContainer = {
    register: (params: { name: string, email: string, password: string }) => register(params.name, params.email, params.password, userRepository),
    login: (params: { email: string, password: string, fastify: FastifyInstance }) => login(params.email, params.password, params.fastify, userRepository),
    refresh: (params: { cookie: string, fastify: FastifyInstance }) => refresh(params.cookie, params.fastify, userRepository),
    logout: (params: { cookie: string, fastify: FastifyInstance }) => logout(params.cookie, params.fastify, userRepository),
    verify: (params: { code: string }) => verify(params.code, userRepository)
}