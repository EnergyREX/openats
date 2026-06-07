import { GenericError } from "src/domain/shared/errors/Generic.error.js";
import { Result } from "src/domain/shared/types/Result.ts";

export interface IMailService {
    verify(): Promise<Result<void, GenericError>>
    sendMail(fromName: string, sendTo: string, subject: string, text?: string, template?: string): Promise<Result<void, GenericError>>
}