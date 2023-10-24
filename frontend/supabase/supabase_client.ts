import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { sbKey, sbURL } from "./constants"

const sbClient = createClientComponentClient({
    supabaseKey: sbKey,
    supabaseUrl: sbURL
})

export { sbClient }
