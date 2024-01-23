import { NextResponse, NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

import { sbKey, sbURL } from "@/supabase/constants"
import { FORGOT_PASSWORD_PAGE_URL, LOGIN_PAGE_URL, REGISTRATION_PAGE_URL } from "./helpers/url_routes"
import { handleRequestToPasswordRecovery } from "./helpers/middleware_helper"
import { Database } from "./supabase"

const portal_urls = [LOGIN_PAGE_URL, REGISTRATION_PAGE_URL, FORGOT_PASSWORD_PAGE_URL]
const dashboard_urls = ['/dashboard']

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()

    const sbMiddleware = createMiddlewareClient<Database>({ req, res }, {
        supabaseKey: sbKey,
        supabaseUrl: sbURL
    })

    const { data: { user } } = await sbMiddleware.auth.getUser()

    /**
     * User logged in, user visits one of the portal pages
     */
    if (user && portal_urls.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin))
    }

    /**
     * No user logged in, dashboard page access attempted
     */
    if (!user && req.nextUrl.pathname.startsWith(dashboard_urls[0])) {
        return NextResponse.redirect(new URL("/", req.nextUrl.origin))
    }

    /**
     * Verify if redirection to /recovery originates from a recognized
     * url.
     */
    if (req.nextUrl.pathname.startsWith("/recovery")) {
        const handleRes = await handleRequestToPasswordRecovery(req, res, sbMiddleware)
        return handleRes
    }

    return res
}

export const config = {
    matcher: [
        '/login',
        '/recovery',
        '/registration',
        '/forgot-password',
        '/dashboard/:path*'
    ],
}