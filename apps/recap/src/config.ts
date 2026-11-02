/** Lazily reads env so importing this module never throws (workflow bundles import things transitively). */
export interface AppConfig {
	cronSecret: string
	/** Zone that decides where one month ends and the next begins. */
	timeZone: string
	adapters: "supabase" | "memory"
	reportBucket: string
	/** The existing "opted-in users + ledgers" API. */
	usersApiUrl: string
	usersApiToken: string | undefined
	supabaseUrl: string
	supabaseServiceRoleKey: string
	smtpUser: string
	smtpAppPassword: string
	smtpFrom: string
}

const env = (name: string, fallback?: string): string => {
	const v = process.env[name] ?? fallback
	if (v === undefined || v === "") throw new Error(`Missing environment variable ${name}`)
	return v
}

export function loadConfig(): AppConfig {
	const adapters = (process.env.RECAP_ADAPTERS ?? "supabase") as AppConfig["adapters"]
	if (adapters !== "supabase" && adapters !== "memory")
		throw new Error(`RECAP_ADAPTERS must be "supabase" or "memory", got "${adapters}"`)
	const real = adapters === "supabase"
	const smtpUser = real ? env("SMTP_USER") : "memory@example.com"
	return {
		cronSecret: env("CRON_SECRET"),
		timeZone: process.env.RECAP_TIME_ZONE || "UTC",
		adapters,
		reportBucket: process.env.RECAP_REPORT_BUCKET || "recap-reports",
		usersApiUrl: real ? env("FINTRACK_USERS_API_URL") : "",
		usersApiToken: process.env.FINTRACK_API_TOKEN || undefined,
		supabaseUrl: real ? env("SUPABASE_URL") : "",
		supabaseServiceRoleKey: real ? env("SUPABASE_SERVICE_ROLE_KEY") : "",
		smtpUser,
		smtpAppPassword: real ? env("SMTP_APP_PASSWORD") : "",
		// Gmail only lets you send as the authenticated account (or a verified alias).
		smtpFrom: process.env.SMTP_FROM || smtpUser
	}
}
