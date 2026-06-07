import nodemailer from "nodemailer"

export interface MailTransporterStrategy {
    createTransporter(): nodemailer.Transporter
    getSenderStrategy(): string
}