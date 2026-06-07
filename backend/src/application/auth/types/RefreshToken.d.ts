export type RefreshToken = {
    uuid: string
    email: string
    type: 'refresh'
    iat: number
    exp: number
}