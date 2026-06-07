export interface IPasswordHasher {
    hash(password: string): Promise<string>
    generateVerificationCode(): Promise<string>
    compare(passwd1: string, passwd2: string ): Promise<boolean>
}