import { Result } from "src/domain/shared/types/Result.ts";
import { Permission } from "../value-objects/Permission.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";

export interface RoleCachePort {
    getPermissions(roleUuid: string): Promise<Result<Permission[], GenericError>>
    setPermissions(roleUuid: string, permissions: Permission[], ttlSeconds: number): Promise<Result<void, GenericError>>
    delRole(roleUuid: string): Promise<Result<void, GenericError>>
}