import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { IPasswordHasher } from 'src/application/ports/IPasswordHasher.ts'

export class PasswordHasher implements IPasswordHasher{
    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, 12) 
    }

    async compare(passwd1: string, passwd2: string ): Promise<boolean> {
        return bcrypt.compare(passwd1, passwd2)
    }

    async generateVerificationCode(): Promise<string> {
        return crypto.randomBytes(32).toString('base64url')
    }
}