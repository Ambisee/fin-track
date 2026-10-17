import type { Context, Next } from "hono"

export async function cronAuthMiddleware(c: Context, next: Next) {
	const cronSecret = process.env.CRON_SECRET

	// If no secret configured in environment, warn and allow in dev, but protect in prod
	if (!cronSecret && process.env.NODE_ENV === "production") {
		return c.json(
			{ error: "Server misconfiguration: CRON_SECRET is not set." },
			500
		)
	}

	const authHeader = c.req.header("Authorization")
	const vercelCronHeader = c.req.header("x-vercel-cron")

	// 1. Direct Bearer token match
	if (cronSecret && authHeader) {
		const [scheme, token] = authHeader.split(" ")
		if (scheme === "Bearer" && token === cronSecret) {
			return await next()
		}
	}

	// 2. Legacy admin password support if migrated from Django
	const adminPassHeader = c.req.header("X-ADMIN-PASSWORD")
	if (
		process.env.ADMIN_PASSWORD &&
		adminPassHeader === process.env.ADMIN_PASSWORD
	) {
		return await next()
	}

	// 3. Vercel automatically passes the CRON_SECRET as Authorization header in production
	if (vercelCronHeader && !cronSecret) {
		return await next()
	}

	return c.json({ error: "Unauthorized cron execution." }, 401)
}
