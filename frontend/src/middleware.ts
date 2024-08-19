import { NextURL } from "next/dist/server/web/next-url";
import { NextRequest, NextResponse } from "next/server";
import { sbMiddleware } from "./lib/supabase";


function isProtectedUrl(url: NextURL) {
    return url.pathname.startsWith("/dashboard")
}

export async function middleware(request: NextRequest) {
    const supabase = sbMiddleware(request)
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({data: {user: null}}))

    /**
     * Redirect unauthenticated user to the login page
     */
    if (user === null && isProtectedUrl(request.nextUrl)) {
        return NextResponse.redirect(new URL("/signin", request.nextUrl.origin))
    }

    

    return NextResponse.next()
}

export const config = {
    matcher: [
        "/",
        "/dashboard/:path*",
        "/signin/:path*",
        "/signup/:path*",
    ]
}