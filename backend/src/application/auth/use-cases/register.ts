import { IPasswordHasher } from "src/application/ports/IPasswordHasher.ts";
import { Err, Ok, Result } from "../../../domain/shared/types/Result.ts";
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts";
import { RegisterError } from "../errors/register.error.ts";
import { User } from "src/domain/users/aggregates/User.ts";
import { IMailService } from "src/application/ports/IMailService.ts";
import { toCommonErrorHandle } from "src/domain/shared/helpers/ToCommonErrorHandle.ts";

export async function register(name: string, email: string, password: string, 
    repository: IUserRepository, hasher: IPasswordHasher, mailService: IMailService): Promise<Result<void, RegisterError>> {

    const existEmail = await repository.getByEmail(email)
    
    if (existEmail.ok) {
        return Err({ message: "Email already exists!", code: "ERR_USER_ALREADY_EXISTS" })
    }
    
    try {
        const uuid = crypto.randomUUID()
        const hashedPassword = await hasher.hash(password)
        const user = await User.create(uuid, name, email, hashedPassword, false)
        const verificationCode = await hasher.generateVerificationCode()

        const saveResult = await repository.save(user, verificationCode)

        if (!saveResult.ok) {
            return Err({ message: saveResult.error.message, code: "ERR_USER_REGISTER_FAILED" })
        }

        //* Still needs some work, such as adding a template and put inside an email.
        mailService.sendMail('no-reply', user.getEmail(), "Your verification code", `Your verification code is ${verificationCode}. It will expire in 24h.` )

        return Ok(undefined)
    } catch (err) {
        return Err(toCommonErrorHandle(err, 'ERR_USER_REGISTER_FAILED'))
    }
}