import { User } from "../aggregates/User.ts"
import { Result } from "../../shared/types/Result.ts"
import { UserRepositoryError } from "../errors/UserRepositoryError.ts"

export interface IUserRepository {
    save(user: User, verificationCode: string): Promise<Result<void, UserRepositoryError>>
    verifyUser(verificationCode: string): Promise<Result<void, UserRepositoryError>> //* true if it verifies properly

    getByUuid(uuid: string): Promise<Result<User, UserRepositoryError>>
    getByEmail(email: string): Promise<Result<User, UserRepositoryError>>

    getVerificationCode(code: string): Promise<Result<string, UserRepositoryError>> //* Useful when sending an email
    checkRevoked(cookie: string): Promise<Result<void, UserRepositoryError>>

    changeName(user: User): Promise<Result<void, UserRepositoryError>> //* Only non-sensible data, such as name.. etc
    changePassword(password: string): Promise<Result<void, UserRepositoryError>>
    changeEmail(email: string): Promise<Result<void, UserRepositoryError>>

    invalidateRefresh(refresh: string, iat: number, exp: number): Promise<Result<void, UserRepositoryError>>
    delete(uuid: string): Promise<Result<void, UserRepositoryError>>
}