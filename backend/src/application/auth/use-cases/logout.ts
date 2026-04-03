import { FastifyInstance } from "fastify"
import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts" 
import { Result } from "../../../domain/shared/types/Result.ts"
import { LogoutError } from "../errors/logout.error.ts"
import { RefreshToken } from "../types/RefreshToken.js"

export async function logout
(cookie: string, fastify: FastifyInstance, userRepository: IUserRepository): Promise<Result<void, LogoutError>> {

  // Check if the token is legit
  
  try {
    fastify.jwt.verify(cookie)

  } catch (err) {
    return {
      ok: false,
      error: { message: "This cookie is not valid!", code: "ERR_USER_LOGOUT_COOKIE_NOT_VALID" }
    }
  }

  const cookieData = fastify.jwt.decode(cookie) as RefreshToken

  // If legit, invalidate in database.
  const result = await userRepository.invalidateRefresh(cookie, cookieData.iat, cookieData.exp)

  if (result.ok) {
    return { ok: true, value: undefined }
  } else {
    return { ok: false, error: { message: result.error.message, code: "ERR_USER_LOGOUT_INFRASTRUCTURE" } }
  }
}
