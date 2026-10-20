import nodemailer, { type Transporter } from "nodemailer"

export interface MonthlyReportEmailParams {
	to: string
	username: string
	ledgerName: string
	periodName: string
	pdfBuffer: Buffer
}

export interface MailerService {
	sendMonthlyReportEmail: (params: MonthlyReportEmailParams) => Promise<void>
}

export class DummyMailerService implements MailerService {
	async sendMonthlyReportEmail(params: MonthlyReportEmailParams) {
		// Dummy Report Email Sender
	}
}

export class GmailMailerService implements MailerService {
	private transporter: Transporter

	constructor(mailerEmail: string, mailerPassword: string) {
		this.transporter = nodemailer.createTransport({
			host: "smtp.gmail.com",
			port: 465,
			secure: true, // SSL
			auth: {
				user: mailerEmail,
				pass: mailerPassword
			}
		})
	}

	async sendMonthlyReportEmail(params: {
		to: string
		username: string
		ledgerName: string
		periodName: string
		pdfBuffer: Buffer
	}): Promise<void> {
		const fromEmail = process.env.GMAIL_EMAIL || "no-reply@fintrack.app"
		const filename = `Monthly Financial Report - ${params.ledgerName} (${params.periodName}).pdf`

		const html = `
			<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
				<h2 style="padding-bottom: 0.5rem; color: #111;">Hello ${params.username},</h2>
				<p>
					Your monthly financial report is ready.
					You will find attached to this email the report for the ledger <b>${params.ledgerName}</b> and period <b>${params.periodName}</b>.
				</p>
				<p style="margin-top: 2rem;">Thank you for using FinTrack.</p>
			</div>
		`

		await this.transporter.sendMail({
			from: `"FinTrack" <${fromEmail}>`,
			to: params.to,
			subject: `Monthly Financial Report - ${params.periodName}`,
			html,
			attachments: [
				{
					filename,
					content: params.pdfBuffer,
					contentType: "application/pdf"
				}
			]
		})
	}
}
