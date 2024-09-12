import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { sbMiddleware } from "./lib/supabase";


function isProtectedUrl(url: NextURL) {
    return url.pathname.startsWith("/dashboard")
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request })
    const supabase = sbMiddleware(request, response)

    /**
     * Redirect unauthorized user to the signin page when accessing the password recovery page
     */
    if (request.nextUrl.pathname.startsWith("/recovery")) {
        const token_hash = request.nextUrl.searchParams.get("token_hash")

        if (token_hash === null) {
            console.log("No token_hash")
            return NextResponse.redirect(new URL("/", request.url))
        }

        const otpVerification = await supabase.auth.verifyOtp({ type: "email", token_hash: token_hash })
        if (otpVerification.error !== null) {
            console.log("OTP verification failed")
            console.log("Reason:", otpVerification.error.message)
            return NextResponse.redirect(new URL("/sign-in", request.url))
        }
        
        return response
    }

    const { data: { user } } = await supabase.auth.getUser().catch(() => ({data: {user: null}}))

    /**
     * Redirect unauthenticated user to the login page when accessing the dashboard
     */
    if (user === null && isProtectedUrl(request.nextUrl)) {
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
        "/sign-up/:path*",
    ]
}