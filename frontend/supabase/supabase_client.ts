import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

import { sbKey, sbURL } from "./constants"
import { Database } from "@/supabase"

const sbClient = createClientComponentClient<Database>({
    supabaseKey: sbKey,
    supabaseUrl: sbURL
})

export { sbClient }
