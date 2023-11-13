import { NextRequest, NextResponse } from "next/server"
import { SupabaseClient } from "@supabase/auth-helpers-nextjs"
import { sbURL } from "@/supabase/constants"
import { EmailOtpType } from "@supabase/supabase-js"

async function handleRequestToPasswordRecovery(
    req: NextRequest,
    supabase: SupabaseClient
) {
    const res = NextResponse.next()
    const token = req.nextUrl.searchParams.get("token")
    const email = req.nextUrl.searchParams.get("email")

    if (token === null || email === null) {
        return NextResponse.error()
    }

    const { data, error } = await supabase.auth.verifyOtp({ email, type: "recovery", token: token })

    if (error !== null) {
        return NextResponse.error()
    }

    return res
}


export { 
    handleRequestToPasswordRecovery
}