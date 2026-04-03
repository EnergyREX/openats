import { Result } from "../../../domain/shared/types/Result.ts";
import { UserFactory } from "../../../domain/users/factories/User.factory.ts";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { RegisterError } from "../errors/register.error.ts";

export async function register(
    name: string, email: string, password: string, repository: IUserRepository): 
    Promise<Result<void, RegisterError>> {

    const existEmail = await repository.getByEmail(email)
    
    if (existEmail.ok) {
        return { ok: false, error: { message: "Email already exists!", code: "ERR_USER_ALREADY_EXISTS" } }
    }
    
    try {
        const factory = new UserFactory()
        const uuid = crypto.randomUUID()
        const hashedPassword = await bcrypt.hash(password, 12)
        const user = await factory.create(uuid, name, email, hashedPassword, false)
        const verificationCode = await crypto.randomBytes(32).toString('base64url')

        const saveResult = await repository.save(user, verificationCode)

        if (!saveResult.ok) {
            return { ok: false, error: {
                message: saveResult.error.message,
                code: "ERR_USER_REGISTER_FAILED"
            }}
        }

        return { ok: true, value: undefined }
    } catch (err) {
        if (err instanceof Error) {
            return { ok: false, error: { message: err.message, code: "ERR_USER_REGISTER"}}
        } else {
            return { ok: false, error: { message: "Unknown error", code: "ERR_USER_REGISTER" }}
        }
    }
}