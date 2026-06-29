import { login } from "../../application/auth/use-cases/login.ts"
import { register } from "../../application/auth/use-cases/register.ts"
import { UserRepositoryImpl } from "../../infrastructure/repositories/UserRepositoryImpl.ts"
import { refresh } from "../../application/auth/use-cases/refresh.ts"
import { logout } from "../../application/auth/use-cases/logout.ts"
import { verify } from "../../application/auth/use-cases/verify.ts"
import { RoleRepositoryImpl } from "src/infrastructure/repositories/RoleRepositoryImpl.ts"
import { PasswordHasher } from "src/infrastructure/services/PasswordHasher.ts"
import { TokenService } from "src/infrastructure/services/TokenService.ts"
import { MailService } from "src/infrastructure/services/MailService.ts"
import { me } from "src/application/auth/use-cases/me.ts"
import { getRoles } from "src/application/auth/use-cases/getRoles.ts"
import { getUserRoles } from "src/application/auth/use-cases/getUserRoles.ts"

const userRepository = new UserRepositoryImpl()
const roleRepository = new RoleRepositoryImpl()
const hasher = new PasswordHasher()
const tokenService = new TokenService()
const mailService = new MailService()

export const authContainer = {
    register: (params: { name: string, email: string, password: string }) => register(params.name, params.email, params.password, userRepository, hasher, mailService),
    login: (params: { email: string, password: string }) => login(params.email, params.password, tokenService, userRepository, roleRepository, hasher),
    refresh: (params: { cookie: string }) => refresh(params.cookie, tokenService, userRepository, roleRepository),
    logout: (params: { cookie: string }) => logout(params.cookie, tokenService, userRepository),
    verify: (params: { code: string }) => verify(params.code, userRepository),
    me: (params: { uuid: string }) => me(params.uuid, userRepository),
    allRoles: () => getRoles(roleRepository),
    userRoles: (params: { uuid: string }) => getUserRoles(params.uuid, roleRepository)
}