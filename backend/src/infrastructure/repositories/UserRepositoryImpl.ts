import db from '../../config/database.ts'
import { Result } from '../../domain/shared/types/Result.ts'
import { User } from '../../domain/users/aggregates/User.ts'
import { UserRepositoryError } from '../../domain/users/errors/UserRepositoryError.ts'
import { UserFactory } from '../../domain/users/factories/User.factory.ts'
import { IUserRepository } from '../../domain/users/repositories/IUserRepository.ts'
import { revokedTokens } from '../drizzle/schema/revokedTokens.ts'
import { users } from '../drizzle/schema/users.ts'
import { eq } from 'drizzle-orm' 

export class UserRepositoryImpl implements IUserRepository {

    async save(user: User, verificationCode: string): Promise<Result<void, UserRepositoryError>> {
        
        
        try {
            await db.insert(users).values({
                uuid: user.getUUID(),
                name: user.getName(),
                email: user.getEmail(),
                password: user.getPassword(),
                verificationCode: verificationCode
            })
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_CREATE" }}
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_USER_CREATE" }}
            }
        }
    }

    async verifyUser(verificationCode: string): Promise<Result<void, UserRepositoryError>> {
        const user = await db.select().from(users).where(eq(users.verificationCode, verificationCode))

        if (user.length > 0) {
            await db.update(users).set({ verified: true, verificationCode: "" })
            return { ok: true, value: undefined }
        } else {
            return { ok: false, error: { message: "Could not verify the user", code: "ERR_USER_NOT_FOUND" } }
        }
    }

    async getVerificationCode(code: string): Promise<Result<string, UserRepositoryError>> {
        const data = await db.select({ verificationCode: users.verificationCode })
        .from(users)
        .where(eq(users.verificationCode, code))

        if (data[0].verificationCode) {
            return { ok: true, value: data[0].verificationCode}
        } else {
            return { ok: false, error: { message: "Could not get verification code", code: "ERR_USER_VERCODE_NOT_FOUND" } }
        }

        
    }

    async getByUuid(uuid: string): Promise<Result<User, UserRepositoryError>> {
        try {
            const data = await db.select().from(users).where(eq(users.uuid, uuid))

            const factory = new UserFactory()
            const user = factory.create(data[0].uuid, data[0].name, data[0].email, data[0].password, data[0].verified)

            if (user) {
                return { ok: true, value: user }
            } else {
                return { ok: false, error: { message: "User not found", code: "ERR_USER_NOT_FOUND" } }
            }

        } catch (err) {
            console.log(err)
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_NOT_FOUND" } }
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_USER_NOT_FOUND" } }
            }
        }
    }

    async getByEmail(email: string): Promise<Result<User, UserRepositoryError>> {
        try {
            const data = await db.select().from(users).where(eq(users.email, email))

            if (data.length == 0) {
                return { ok: false, error: { message: "User not found", code: "ERR_USER_NOT_FOUND" }}
            }

            const factory = new UserFactory()
            const user = factory.create(data[0].uuid, data[0].name, data[0].email, data[0].password, data[0].verified)

            return { ok: true, value: user }


        } catch (err) {
            console.log(err)
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_NOT_FOUND" }}
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_USER_NOT_FOUND" } }
            }
        }
    }

    
    async changeName(user: User): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.update(users).set({
                name: user.getName(),
            }).where(eq(users.uuid, user.getUUID()))

            return { ok: true, value: undefined }
        } catch (err) {
            console.log(err)
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_CHANGE_NAME" }}
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_USER_CHANGE_NAME" }}
            }
        }
    }

    async changePassword(password: string): Promise<Result<void, UserRepositoryError>> {
        return { ok: false, error: { message: "Couldn't not change password: Not implemented yet", code: "ERR_USER_NOT_IMPLEMENTED" } }
    }

    async changeEmail(email: string): Promise<Result<void, UserRepositoryError>> {
        return { ok: false, error: { message: "Couldn't not change email: Not implemented yet", code: "ERR_USER_NOT_IMPLEMENTED" } }
    }

    async invalidateRefresh(refresh: string, iat: number, exp: number): Promise<Result<void, UserRepositoryError>> {

        try {
            await db.insert(revokedTokens).values({
            token: refresh,
            expires_at: exp,
            created_at: iat
        })
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_INVALIDATE_REFRESH" }}
            } else {
                return { ok: false, error: { message: "Unknown error", code: "ERR_USER_INVALIDATE_REFRESH" }}
            }
        }

    }

    async checkRevoked(token: string): Promise<Result<void, UserRepositoryError>> {
        const data = await db.select().from(revokedTokens).where(eq(revokedTokens.token, token))
        
        if (data.length > 0) {
            return { ok: true, value: undefined  }
        } else {
            return { ok: false, error: { message: "Revoked token doesn't exist", code: "ERR_USER_REVOKED_TOKEN_NOT_EXIST" }}
        }
    }

    async delete(uuid: string): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.delete(users).where(eq(users.uuid, uuid))
            return { ok: true, value: undefined }
        } catch (err) {
            if (err instanceof Error) {
                return { ok: false, error: { message: err.message, code: "ERR_USER_DELETE" }}
            } else {
                return { ok: false, error: { message: "Could not delete user", code: "ERR_USER_DELETE" }}
            }
        }

        
    }
} 