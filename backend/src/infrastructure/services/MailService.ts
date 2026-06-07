import nodemailer from "nodemailer"
import { Err, Ok, Result } from 'src/domain/shared/types/Result.ts'
import { GenericError } from 'src/domain/shared/errors/Generic.error.js'
import { MailTransporterStrategy } from './strategies/mail/MailTransporterStrategy.ts';
import { toCommonErrorHandle } from 'src/domain/shared/helpers/ToCommonErrorHandle.ts';
import { SESStrategy } from './strategies/mail/SESStrategy.ts';
import { SMTPStrategy } from './strategies/mail/SMTPStrategy.ts';
import { IMailService } from 'src/application/ports/IMailService.ts';

export class MailService implements IMailService {
    private transporter: nodemailer.Transporter;
    private sender: string
    
    constructor() {
        const mailServiceStrategy: Record<string, MailTransporterStrategy> = {
            'ses': new SESStrategy(),
            'smtp': new SMTPStrategy()
        }
        const strategy = mailServiceStrategy[process.env.MAIL_PROVIDER!]
        this.transporter = strategy.createTransporter()
        this.sender = strategy.getSenderStrategy()

    }

    async verify(): Promise<Result<void, GenericError>> {
        try {                                                                                                       
            await this.transporter.verify()
            return Ok(undefined)                                                                                    
        } catch (err) {                         
            return Err(toCommonErrorHandle(err, 'ERR_MAILSERVICE_TRANSPORTER_VERIFICATION'))
        }  
    }

    async sendMail(fromName: string, sendTo: string, subject: string, text?: string, template?: string): Promise<Result<void, GenericError>> {
        try {
            const conn = await this.verify()
            if (!conn.ok) return Err(toCommonErrorHandle(conn.error.message, conn.error.code))
            await this.transporter.sendMail({
                from: `"${fromName}"<${this.sender}>`,
                to: sendTo,
                subject: subject,
                text: text,
                html: template
            })

            return Ok(undefined)
        } catch (err) {
            return Err(toCommonErrorHandle(err, 'ERR_MAILSERVICE_SEND'))
        }
    }
}