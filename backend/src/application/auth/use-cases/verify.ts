import { Result } from "../../../domain/shared/types/Result.ts";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";
import { VerificationError } from "../errors/verify.error.ts";

export async function verify(code: string, repository: IUserRepository): Promise<Result<void, VerificationError>> {
    try {
        const result = await repository.verifyUser(code)

        if (!result.ok) {
            return {
                ok: false,
                error: {
                    message: result.error.message,
                    code: "ERR_AUTH_USER_VERIFICATION"
                }
            }
        }

        return { ok: true, value: undefined }
    } catch (err) {
        return {
            ok: false,
            error: {
                message: err instanceof Error ? err.message : "Unknown error",
                code: "ERR_AUTH_USER_VERIFICATION"
            }
        }
    }
}
