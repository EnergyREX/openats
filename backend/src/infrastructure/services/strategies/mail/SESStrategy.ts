import { MailTransporterStrategy } from "./MailTransporterStrategy.ts"
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import nodemailer from 'nodemailer'

export class SESStrategy implements MailTransporterStrategy {
    createTransporter(): nodemailer.Transporter {
        const sesClient = new SESv2Client({ 
            region: process.env.AWS_REGION!,  
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
        return nodemailer.createTransport({ SES: { sesClient, SendEmailCommand } })
    }

    getSenderStrategy(): string {
        return process.env.MAIL_SENDER!
    }
}