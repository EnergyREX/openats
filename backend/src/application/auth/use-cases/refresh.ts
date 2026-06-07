import { Err, Ok, Result } from "../../../domain/shared/types/Result.ts";
import { RefreshError } from "../errors/refresh.error.ts";
import type { RefreshResult } from "../types/RefreshResult.d.ts"
import { RefreshToken } from "../types/RefreshToken.js";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";
import { ITokenService } from "src/application/ports/ITokenService.ts";
import { IRoleRepository } from "src/domain/users/repositories/IRoleRepository.ts";

export async function refresh(cookie: string, jwt: ITokenService, repository: IUserRepository, roleRepository: IRoleRepository): Promise<Result<RefreshResult, RefreshError>> {
    const result = await jwt.verify<RefreshToken>(cookie);
    if (!result.ok) return Err(result.error)

    const tokenData = result.value
    if (tokenData.type !== 'refresh') return Err({ message: "This is not a refreshToken!", code: "ERR_AUTH_REFRESH_NOT_A_REFRESH" })

    const isRevoked = await repository.checkRevoked(cookie)
    if (isRevoked) return Err({ message: "This token was revoked!", code: "ERR_AUTH_REFRESH_INVALIDATED" })

    const invalidated = await repository.invalidateRefresh(cookie, tokenData.iat, tokenData.exp);
    if (!invalidated.ok) return Err(invalidated.error);

    const dbUserRoles = await roleRepository.getByUserUUID(tokenData.uuid)
    if (!dbUserRoles.ok) return Err(dbUserRoles.error) 
    const rolesUuids = dbUserRoles.value.map((r) => r.getUUID() )

    const refreshToken = await jwt.sign({
        uuid: tokenData.uuid, 
        email: tokenData.email,
        type: 'refresh'
    }, { expiresIn: "7d" });

    const accessToken = await jwt.sign({
        uuid: tokenData.uuid,
        roles: rolesUuids,
        type: 'access'
    }, { expiresIn: "30m" });


    return Ok({ refreshToken, accessToken});
}