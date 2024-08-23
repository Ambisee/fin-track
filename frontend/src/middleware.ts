import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { sbMiddleware } from "./lib/supabase";
import { requestFormReset } from "react-dom";


function isProtectedUrl(url: NextURL) {
    return url.pathname.startsWith("/dashboard")
}

export async function middleware(request: NextRequest) {
    const supabase = sbMiddleware(request)
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({data: {user: null}}))

    
    /**
     * Redirect unauthenticated user to the login page when accessing the dashboard
     */
    if (user === null && isProtectedUrl(request.nextUrl)) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
    }

    /**
     * Redirect unauthorized user to the signin page when accessing the password recovery page
     */
    if (request.nextUrl.pathname.startsWith("/recovery")) {
        const token = request.nextUrl.searchParams.get("token")
        const email = request.nextUrl.searchParams.get("email")

        if (token === null || email === null) {
            return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
        }

        const { data, error } = await supabase.auth.verifyOtp({type: "recovery", token: token, email: email})
        if (error !== null) {
            return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
        }

        return NextResponse.next()
    }


    return NextResponse.next()
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