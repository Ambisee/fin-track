import { Context, Next } from "hono"
import { supabase } from "../services/supabase"
import type { User } from "@supabase/supabase-js"

declare module "hono" {
	interface ContextVariableMap {
		user: User
	}
}

export async function authMiddleware(c: Context, next: Next) {
	const authHeader = c.req.header("Authorization")

	if (!authHeader) {
		return c.json(
			{ error: "Authentication failed. Missing Authorization header." },
			401
		)
	}

	const [scheme, token] = authHeader.split(" ")
	if (scheme !== "Bearer" || !token) {
		return c.json(
			{
				error:
					"Authentication failed. Invalid authorization format. Expected 'Bearer <token>'."
			},
			401
		)
	}

	try {
		const {
			data: { user },
			error
		} = await supabase.auth.getUser(token)

		if (error || !user) {
			return c.json(
				{
					error:
						error?.message ||
						"Authentication failed. Invalid or expired credentials."
				},
				401
			)
		}

		c.set("user", user)
		await next()
	} catch (err: any) {
		return c.json(
			{ error: err?.message || "Internal error during authentication." },
			500
		)
	}
}
