import { GenericError } from "src/domain/shared/errors/Generic.error.js"
import { Result } from "src/domain/shared/types/Result.ts"
import jwt from "jsonwebtoken"

export interface ITokenService {
    sign(payload: string | object, options: jwt.SignOptions): Promise<string>
    verify<T>(token: string): Promise<Result<T, GenericError>>
    decode<T>(token: string): Promise<T>
}