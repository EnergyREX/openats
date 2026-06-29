export type jwtData = {
    uuid: string,
    roles: string[],
    type: 'access',
    iat: number,
    exp: number
}