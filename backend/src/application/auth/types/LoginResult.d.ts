type LoginResult = {
    uuid: string
    email: string
    tokens: {
        refreshToken: string,
        accessToken: string
    }


}