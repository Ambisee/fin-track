import nodemailer, { type Transporter } from "nodemailer"
import type { AppConfig } from "../../config"
import {
	PermanentMailError,
	type Mailer,
	type MailMessage
} from "../../domain/ports"

/** Auth failures and 5xx replies will not get better by retrying; everything else might. */
export function classifyMailError(err: unknown): Error {
	const e = err as { code?: string; responseCode?: number; message?: string }
	const message = e?.message ?? String(err)
	if (e?.code === "EAUTH" || (e?.responseCode !== undefined && e.responseCode >= 500)) {
		return new PermanentMailError(message)
	}
	return err instanceof Error ? err : new Error(message)
}

export class NodemailerMailer implements Mailer {
	constructor(
		private readonly transport: Pick<Transporter, "sendMail">,
		private readonly from: string
	) {}

	async send(message: MailMessage): Promise<void> {
		try {
			await this.transport.sendMail({
				from: this.from,
				to: message.to,
				subject: message.subject,
				text: message.text,
				html: message.html,
				attachments: message.attachments.map((a) => ({
					filename: a.filename,
					content: Buffer.from(a.content),
					contentType: a.contentType
				}))
			})
		} catch (err) {
			throw classifyMailError(err)
		}
	}
}

/**
 * Gmail SMTP with an App Password (the account needs 2-Step Verification). Consumer Gmail caps sending
 * at roughly 500 recipients/day; Google Workspace allows more.
 */
export function createGmailMailer(config: AppConfig): Mailer {
	const transport = nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: { user: config.smtpUser, pass: config.smtpAppPassword }
	})
	return new NodemailerMailer(transport, config.smtpFrom)
}
