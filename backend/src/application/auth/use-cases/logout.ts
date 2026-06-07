import { IUserRepository } from "../../../domain/users/repositories/IUserRepository.ts" 
import { Err, Ok, Result } from "../../../domain/shared/types/Result.ts"
import { LogoutError } from "../errors/logout.error.ts"
import { RefreshToken } from "../types/RefreshToken.js"
import { ITokenService } from "src/application/ports/ITokenService.ts"

export async function logout (cookie: string, jwt: ITokenService, userRepository: IUserRepository): Promise<Result<void, LogoutError>> {
  const token = await jwt.verify<RefreshToken>(cookie)
  if (!token.ok) return Err(token.error) 
  const tokenData = token.value
  // If legit, invalidate in database.
  const result = await userRepository.invalidateRefresh(cookie, tokenData.iat, tokenData.exp)
  if (!result.ok) return Err(result.error)

  return Ok(undefined)
}
