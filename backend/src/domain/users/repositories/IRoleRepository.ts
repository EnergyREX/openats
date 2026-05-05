import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Role } from "../aggregates/Role.ts";
import { Result } from "src/domain/shared/types/Result.ts";

export interface IRoleRepository {
    save(value: Role): Promise<Result<string, GenericError>>

    getAll(): Promise<Result<Role[], GenericError>>
    getByUUID(uuid: string): Promise<Result<Role, GenericError>>
    getByUserUUID(userUuid: string): Promise<Result<Role[], GenericError>>

    update(value: Role): Promise<Result<void, GenericError>>
    delete(uuid: string): Promise<Result<void, GenericError>>
}