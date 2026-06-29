import { toError } from "src/domain/shared/helpers/ToError.ts";
import { Err, Ok, Result } from "../../../domain/shared/types/Result.ts";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";
import { VerificationError } from "../errors/verify.error.ts";

export async function verify(code: string, repository: IUserRepository): Promise<Result<void, VerificationError>> {
    try {
        const result = await repository.verifyUser(code)

        if (!result.ok) return Err(result.error)

        return Ok(undefined)
    } catch (err) {
        return Err(toError(err, "ERR_AUTH_USER_VERIFICATION"))
    }
}
