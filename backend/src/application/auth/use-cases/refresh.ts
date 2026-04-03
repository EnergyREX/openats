import { FastifyInstance } from "fastify";
import { Result } from "../../../domain/shared/types/Result.ts";
import { RefreshError } from "../errors/refresh.error.ts";
import type { RefreshResult } from "../types/RefreshResult.d.ts"
import { RefreshToken } from "../types/RefreshToken.js";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";

export async function refresh(
    cookie: string, 
    fastify: FastifyInstance, 
    repository: IUserRepository
): Promise<Result<RefreshResult, RefreshError>> {
    let result: RefreshToken;

    console.log(cookie)

    try {
        result = await fastify.jwt.verify(cookie) as RefreshToken;
        console.log(result)
    } catch (err) {
        return { ok: false, error: { message: "Cookie is not valid!", code: "ERR_AUTH_REFRESH_TOKEN" } };
    }

    const invalidated = await repository.invalidateRefresh(cookie, result.iat, result.exp);
    if (!invalidated.ok) {
        return { ok: false, error: { message: "Failed to invalidate refresh token", code: "ERR_AUTH_REFRESH_INVALIDATE" } };
    }

    const refreshToken = fastify.jwt.sign({
        uuid: result.uuid, 
        email: result.email 
    }, { expiresIn: "7d" });

    const accessToken = fastify.jwt.sign({
        uuid: result.uuid 
    }, { expiresIn: "30m" });

    return { ok: true, value: { refreshToken, accessToken } };
}