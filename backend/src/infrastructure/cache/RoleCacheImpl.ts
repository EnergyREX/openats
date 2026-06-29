import redis from "src/config/redis.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { RoleCachePort } from "src/domain/users/ports/RoleCachePort.ts";
import { IRoleRepository } from "src/domain/users/repositories/IRoleRepository.ts";
import { Permission } from "src/domain/users/value-objects/Permission.ts";
import { RoleRepositoryImpl } from "../repositories/RoleRepositoryImpl.ts";

const ROLE_CACHE_TTL = 1800

export class RoleCacheImpl implements RoleCachePort {

    private readonly roleRepository: IRoleRepository

    constructor() {
        this.roleRepository = new RoleRepositoryImpl()
    }

    async getPermissions(roleUuid: string): Promise<Result<Permission[], GenericError>> {
        try {
            const raw = await redis.get(`role:${roleUuid}`)

            if (raw) {
                const parsed: { id: number; name: string }[] = JSON.parse(raw)
                return Ok(parsed.map(p => Permission.create(p.id, p.name)))
            }

            // Cache miss → fallback to DB and repopulate
            const dbResult = await this.roleRepository.getByUUID(roleUuid)
            if (!dbResult.ok) return Err(dbResult.error)

            const permissions = dbResult.value.getPermissions()
            await this.setPermissions(roleUuid, permissions, ROLE_CACHE_TTL)

            return Ok(permissions)
        } catch (err) {
            return Err(toError(err, 'ERR_CACHE_GET'))
        }
    }

    async setPermissions(roleUuid: string, permissions: Permission[], ttlSeconds: number): Promise<Result<void, GenericError>> {
        try {
            const payload = permissions.map(p => ({ id: p.getUUID(), name: p.getName() }))
            await redis.set(`role:${roleUuid}`, JSON.stringify(payload), { EX: ttlSeconds })
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_CACHE_SET'))
        }
    }

    async delRole(roleUuid: string): Promise<Result<void, GenericError>> {
        try {
            await redis.del(`role:${roleUuid}`)
            return Ok(undefined)
        } catch (err) {
            return Err(toError(err, 'ERR_CACHE_DEL'))
        }
    }
}
