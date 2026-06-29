import { UUID } from "src/domain/shared/value-objects/UUID.ts"

export type AccessToken = {
    uuid: UUID,
    roles: string,
    type: 'access'
    iat: number
    exp: number
}