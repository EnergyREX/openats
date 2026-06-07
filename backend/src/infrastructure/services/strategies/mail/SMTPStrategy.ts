import { MailTransporterStrategy } from "./MailTransporterStrategy.ts";
import nodemailer from 'nodemailer'

export class SMTPStrategy implements MailTransporterStrategy {
    createTransporter(): nodemailer.Transporter {
        const port = Number(process.env.SMTP_PORT)
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST!,
            port,
            secure: port === 465,
            auth: {
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            },
        })
    }

    getSenderStrategy(): string {
        return process.env.MAIL_SENDER!
    }
}