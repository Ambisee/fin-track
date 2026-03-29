import { NextURL } from "next/dist/server/web/next-url"
import { NextRequest, NextResponse } from "next/server"
import { supabaseMiddlewareClient } from "./lib/supabase"

function isProtectedUrl(url: NextURL) {
	return url.pathname.startsWith("/dashboard")
}

export async function proxy(request: NextRequest) {
	const response = NextResponse.next({ request })
	const supabase = supabaseMiddlewareClient(request, response)

	/**
	 * Redirect unauthorized user to the signin page when accessing the password recovery page
	 */
	if (request.nextUrl.pathname.startsWith("/recovery")) {
		const token_hash = request.nextUrl.searchParams.get("token_hash")

		if (token_hash === null) {
			console.error("No token_hash")
			return NextResponse.redirect(new URL("/", request.url))
		}

		const otpVerification = await supabase.auth.verifyOtp({
			type: "email",
			token_hash: token_hash
		})
		if (otpVerification.error !== null) {
			console.error("OTP verification failed.")
			console.error(`Reason: ${otpVerification.error.message}.`)
			return NextResponse.redirect(new URL("/sign-in", request.url))
		}

		return response
	}

	const { data, error } = await supabase.auth.getClaims()

	/**
	 * Redirect unauthenticated user to the login page when accessing the dashboard
	 */
	if (data === null && isProtectedUrl(request.nextUrl)) {
		console.error(
			`Unauthorized access to protected URL. Reason: ${error?.message}.`
		)
		return NextResponse.redirect(new URL("/sign-in", request.url))
	}

	return response
}

export const config = {
	matcher: [
		"/",
		"/recovery",
		"/dashboard/:path*",
		"/sign-in/:path*",
		"/sign-up/:path*"
	]
}
