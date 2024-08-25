import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { sbMiddleware } from "./lib/supabase";
import { requestFormReset } from "react-dom";


function isProtectedUrl(url: NextURL) {
    return url.pathname.startsWith("/dashboard")
}

export async function middleware(request: NextRequest) {
    const response = NextResponse.next({ request, })
    const supabase = sbMiddleware(request, response)

    /**
     * Redirect unauthorized user to the signin page when accessing the password recovery page
     */
    if (request.nextUrl.pathname.startsWith("/recovery")) {
        const token = request.nextUrl.searchParams.get("token")
        const email = request.nextUrl.searchParams.get("email")

        if (token === null || email === null) {
            return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
        }

        const otpVerification = await supabase.auth.verifyOtp({ type: "email", token: token, email: email })
        console.log(response.cookies)
        console.log(request.cookies)
        if (otpVerification.error !== null) {
            return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
        }
        
        return response
    }

    const { data: { user } } = await supabase.auth.getUser().catch(() => ({data: {user: null}}))

    /**
     * Redirect unauthenticated user to the login page when accessing the dashboard
     */
    if (user === null && isProtectedUrl(request.nextUrl)) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
    }


    return response
}

export const config = {
    matcher: [
        "/",
        "/recovery",
        "/dashboard/:path*",
        "/signin/:path*",
        "/signup/:path*",
    ]
}