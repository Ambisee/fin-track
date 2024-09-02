import { Database } from "@/types/supabase"
import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"
import { NextRequest, NextResponse } from "next/server"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! ?? ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY! ?? ""
const supabaseServerKey = process.env.NEXT_SUPABASE_SERVER_KEY! ?? ""

const sbBrowser = createBrowserClient<Database>(supabaseUrl, supabaseKey)

const sbMiddleware = (request: NextRequest, response: NextResponse) => {
    return createServerClient<Database>(supabaseUrl ,supabaseKey, {
        cookies: {
            getAll() {
                return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
                cookiesToSet.forEach(({ name, value }) => 
                    request.cookies.set(name, value)
                )
                cookiesToSet.forEach(({ name, value, options }) => 
                    response.cookies.set(name, value, options)
                )
            },
        }
    })
}

const sbServer = (cookieStore: ReadonlyRequestCookies) => {
    return createServerClient(supabaseUrl, supabaseServerKey, {
		cookies: {
			getAll() {
				return cookieStore.getAll()
			},
			setAll(cookiesToSet) {
				try {
					cookiesToSet.forEach(({ name, value, options }) =>
						cookieStore.set(name, value, options)
					)
				} catch {
					// The `setAll` method was called from a Server Component.
					// This can be ignored if you have middleware refreshing
					// user sessions.
				}
			}
		}
	})

}

export { sbBrowser, sbServer, sbMiddleware, supabaseKey, supabaseUrl }