import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

import { sbKey, sbURL } from "./constants"

const sbServer = (c: any) => createServerComponentClient( { cookies: () => c }, {
    supabaseKey: sbKey,
    supabaseUrl: sbURL
})

export { sbServer }