import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { sbKey, sbURL } from "./constants"

const sbServer = createServerComponentClient( {cookies: cookies}, {
    supabaseKey: sbKey,
    supabaseUrl: sbURL
})

export { sbServer }