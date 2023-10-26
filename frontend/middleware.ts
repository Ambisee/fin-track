import { NextResponse, type NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

import { sbKey, sbURL } from "@/supabase/constants"
import { FORGOT_PASSWORD_PAGE_URL, LOGIN_PAGE_URL, REGISTRATION_PAGE_URL } from "./helpers/url_routes"

const portal_urls = [LOGIN_PAGE_URL, REGISTRATION_PAGE_URL, FORGOT_PASSWORD_PAGE_URL]
const dashboard_urls = ['/dashboard']

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const sb_middleware = createMiddlewareClient({ req, res }, {
        supabaseKey: sbKey,
        supabaseUrl: sbURL
    })

    const { data: { user } } = await sb_middleware.auth.getUser()
    const site_url = new URL(process.env.NEXT_PUBLIC_SITE_URL as string)

    if (site_url.host !== req.nextUrl.host) {
        return NextResponse.error()
    }

    /**
     * User logged in, user visits one of the portal pages
     */
    if (user && portal_urls.includes(req.nextUrl.pathname)) {
        return NextResponse.redirect(new URL("/dashboard", site_url.origin))
    }

    /**
     * No user logged in, dashboard page access attempted
     */
    if (!user && req.nextUrl.pathname.startsWith(dashboard_urls[0])) {
        return NextResponse.redirect(new URL(site_url.origin))
    }

    return res
}

export const config = {
    matcher: [
        ...portal_urls,
        '/dashboard/:path*'
    ],
}