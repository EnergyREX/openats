import db from '../../config/database.ts'
import { Err, Ok, Result } from '../../domain/shared/types/Result.ts'
import { toRepositoryError } from '../../domain/shared/helpers/ToErrorRepository.ts'
import { User } from '../../domain/users/aggregates/User.ts'
import { UserRepositoryError } from '../../domain/users/errors/UserRepositoryError.ts'
import { IUserRepository } from '../../domain/users/repositories/IUserRepository.ts'
import { revokedTokens } from '../drizzle/schema/revokedTokens.ts'
import { users } from '../drizzle/schema/users.ts'
import { eq } from 'drizzle-orm'

export class UserRepositoryImpl implements IUserRepository {

    async save(user: User, verificationCode: string): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.insert(users).values({
                uuid: user.getUUID().toPrimitive(),
                name: user.getName(),
                email: user.getEmail(),
                password: user.getPassword(),
                verificationCode: verificationCode
            })
            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_CREATE'))
        }
    }

    async verifyUser(verificationCode: string): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.update(users).set({ verified: true, verificationCode: "" }).where(eq(users.verificationCode, verificationCode))
            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_NO_VERIFICATION_CODE'))
        }
    }

    async getVerificationCode(code: string): Promise<Result<string, UserRepositoryError>> {
        try {
            const data = await db.select({ verificationCode: users.verificationCode })
                .from(users)
                .where(eq(users.verificationCode, code))

            if (data.length === 0 || !data[0].verificationCode) {
                return Err({ message: "Could not get verification code", code: "ERR_USER_VERCODE_NOT_FOUND" })
            }

            return Ok(data[0].verificationCode)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_VERCODE_NOT_FOUND'))
        }
    }

    async getByUuid(uuid: string): Promise<Result<User, UserRepositoryError>> {
        try {
            const data = await db.select().from(users).where(eq(users.uuid, uuid))

            const user = User.create(data[0].uuid, data[0].name, data[0].email, data[0].password, data[0].verified)

            if (user) {
                return Ok(user)
            } else {
                return Err({ message: "User not found", code: "ERR_USER_NOT_FOUND" })
            }
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_NOT_FOUND'))
        }
    }

    async getByEmail(email: string): Promise<Result<User, UserRepositoryError>> {
        try {
            const data = await db.select().from(users).where(eq(users.email, email))

            if (data.length == 0) {
                return Err({ message: "User not found", code: "ERR_USER_NOT_FOUND" })
            }

            const user = User.create(data[0].uuid, data[0].name, data[0].email, data[0].password, data[0].verified)

            return Ok(user)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_NOT_FOUND'))
        }
    }


    async changeName(user: User): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.update(users).set({
                name: user.getName(),
            }).where(eq(users.uuid, user.getUUID().toPrimitive()))

            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_CHANGE_NAME'))
        }
    }

    async changePassword(userUUID: string, newPasswordHash: string): Promise<Result<void, UserRepositoryError>> {
        try {
            const updated = await db.update(users)
                .set({ password: newPasswordHash })
                .where(eq(users.uuid, userUUID))
                .returning({ uuid: users.uuid })

            if (updated.length === 0) {
                return Err({ message: "User not found", code: "ERR_USER_NOT_FOUND" })
            }

            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_CHANGE_PASSWORD'))
        }
    }

    async changeEmail(userUUID: string, newEmail: string): Promise<Result<void, UserRepositoryError>> {
        try {
            const updated = await db.update(users)
                .set({ email: newEmail })
                .where(eq(users.uuid, userUUID))
                .returning({ uuid: users.uuid })

            if (updated.length === 0) {
                return Err({ message: "User not found", code: "ERR_USER_NOT_FOUND" })
            }

            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_CHANGE_EMAIL'))
        }
    }

    async invalidateRefresh(refresh: string, iat: number, exp: number): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.insert(revokedTokens).values({
                token: refresh,
                expires_at: exp,
                created_at: iat
            })
            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_INVALIDATE_REFRESH'))
        }
    }

    async checkRevoked(token: string): Promise<boolean> {
        const data = await db.select().from(revokedTokens).where(eq(revokedTokens.token, token))

        if (data.length == 0) {
            return false
        } else {
            return true
        }
    }

    async delete(uuid: string): Promise<Result<void, UserRepositoryError>> {
        try {
            await db.delete(users).where(eq(users.uuid, uuid))
            return Ok(undefined)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_USER_DELETE'))
        }
    }
}
