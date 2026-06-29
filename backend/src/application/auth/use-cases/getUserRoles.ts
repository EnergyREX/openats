import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { toError } from "src/domain/shared/helpers/ToError.ts";
import { Result, Err, Ok } from "src/domain/shared/types/Result.ts";
import { Role } from "src/domain/users/aggregates/Role.ts";
import { IRoleRepository } from "src/domain/users/repositories/IRoleRepository.ts";

export async function getUserRoles(userUuid: string, repo: IRoleRepository): Promise<Result<Role[], GenericError>> {
    try {
        const data = await repo.getByUserUUID(userUuid)
        if (!data.ok) return Err(data.error)
        return Ok(data.value)
    } catch (err) {
        return Err(toError(err, "ERR_APPL_GETROLES"))
    }
}