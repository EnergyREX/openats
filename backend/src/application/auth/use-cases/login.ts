import { IUserRepository } from '../../../domain/users/repositories/IUserRepository.ts'
import { Err, Ok, Result } from '../../../domain/shared/types/Result.ts'
import { LoginError } from '../errors/login.error.ts'
import { IRoleRepository } from 'src/domain/users/repositories/IRoleRepository.ts'
import { ITokenService } from 'src/application/ports/ITokenService.ts'
import { IPasswordHasher } from 'src/application/ports/IPasswordHasher.ts'

const DUMMY_HASH = '$2b$12$2Q5P6GJRZy/Q2Mz20P1u2.3xMHSNZfv7Hz6rKKtYfBImcQ06sj7Um'

export async function login (
  email: string, password: string,
  jwt: ITokenService,
  repository: IUserRepository,
  roleRepository: IRoleRepository,
  hasher: IPasswordHasher): Promise<Result<LoginResult, LoginError>> {

  const result = await repository.getByEmail(email)

  const userHash = result.ok ? result.value.getPassword() : DUMMY_HASH
  const passwordsMatch = await hasher.compare(password, userHash)

  if (!result.ok || !passwordsMatch) return Err({ message: "Invalid credentials!", code: "ERR_USER_LOGIN_INVALID" })

  const user = result.value

  if (!user.isVerified()) return Err({ message: "User not verified!", code: "ERR_USER_LOGIN_NOT_VERIFIED" })

  const dbUserRoles = await roleRepository.getByUserUUID(user.getUUID().toPrimitive())
  if (!dbUserRoles.ok) return Err({ message: "User not verified!", code: "ERR_USER_LOGIN_NOT_VERIFIED" })
  const rolesUuids = dbUserRoles.value.map((r) => r.getUUID() )

  // After that, generate booth tokens and return them
  const refreshToken = await jwt.sign({
    uuid: user.getUUID(), 
    email: user.getEmail(),
    type: 'refresh'
  }, { expiresIn: "7d" })

  const accessToken = await jwt.sign({
    uuid: user.getUUID(),
    roles: rolesUuids,
    type: 'access'
  }, { expiresIn: "30m" })

  
  // Return response
  return Ok(
    {
      uuid: user.getUUID().toPrimitive(),
      email: user.getEmail(),
      tokens: {
        accessToken,
        refreshToken
      }
    }
  )
}
