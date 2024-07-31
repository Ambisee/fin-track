import { Database } from "@/types/supabase"
import { createBrowserClient, createServerClient } from "@supabase/ssr"
import { ReadonlyRequestCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! ?? ""
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! ?? ""

const sbBrowser = createBrowserClient<Database>(supabaseUrl, supabaseKey)
const sbServer = (cookieStore: ReadonlyRequestCookies) => {
    return createServerClient(supabaseUrl, supabaseKey, {
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

export { sbBrowser, sbServer, supabaseKey, supabaseUrl }