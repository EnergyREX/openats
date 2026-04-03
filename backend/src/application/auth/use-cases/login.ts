import bcrypt from 'bcrypt'
import { IUserRepository } from '../../../domain/users/repositories/IUserRepository.ts' 
import { FastifyInstance } from 'fastify'
import { Result } from '../../../domain/shared/types/Result.ts'
import { LoginError } from '../errors/login.error.ts'

export async function login (
  email: string, password: string, 
  fastify: FastifyInstance, 
  repository: IUserRepository): Promise<Result<LoginResult, LoginError>> {

  // Check if email exits
  const result = await repository.getByEmail(email)
  
  if (!result.ok) {
    return {
      ok: false,
      error: { message: "Email doesn't exist!", code: "ERR_USER_LOGIN_NO_EMAIL" }
    }
  }
  const user = result.value
  // Check if this user is verified.

  if (!(await user.isVerified())) {
    return {ok: false,
    error: { message: "This user is not verified!", code: "ERR_USER_NOT_VERIFIED" }}
  }
  

  const userPasswd = await user.getPassword()

  const passwordsMatch = await bcrypt.compare(String(password), String(userPasswd))

  if (!passwordsMatch) {
    return {
      ok: false,
      error: { message: "Password doesn't match!", code: "ERR_USER_LOGIN_WRONG_PASSWORD" }
    }
  }

  // After that, generate booth tokens and return them
  const refreshToken = fastify.jwt.sign({
    uuid: user.getUUID(), 
    email: user.getEmail() 
  }, { expiresIn: "7d" })

  const accessToken = fastify.jwt.sign({
    uuid: user.getUUID(), 
  }, { expiresIn: "30m" })

  
  // Return response
  return {
    ok: true,
    value: {
      uuid: user.getUUID(),
      email: user.getEmail(),
      tokens: {
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    }
  }
}
