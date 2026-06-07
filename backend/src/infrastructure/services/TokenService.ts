import { ITokenService } from "src/application/ports/ITokenService.ts";
import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Err, Ok, Result } from "src/domain/shared/types/Result.ts";
import jwt from 'jsonwebtoken'
import { toRepositoryError } from "src/domain/shared/helpers/ToErrorRepository.ts";

export class TokenService implements ITokenService {
    private readonly privateKey = process.env.JWT_SECRET_KEY!

    async sign(payload: string | object, options: jwt.SignOptions): Promise<string> {
        return jwt.sign(payload, this.privateKey, { algorithm: 'HS256', ...options })
    }

    async verify<T>(token: string): Promise<Result<T, GenericError>> {
        try {
            return Ok(jwt.verify(token, this.privateKey, { algorithms: ['HS256'] }) as T)
        } catch (err) {
            return Err(toRepositoryError(err, 'ERR_TOKEN_VERIFICATION'))
        }
    }

    async decode<T>(token: string): Promise<T> {
        return jwt.decode(token) as T
    }
}