import { NextRequest, NextResponse } from "next/server"
import { SupabaseClient } from "@supabase/auth-helpers-nextjs"

async function handleRequestToPasswordRecovery(
    req: NextRequest,
    res: NextResponse,
    supabase: SupabaseClient
) {
    const token = req.nextUrl.searchParams.get("token")
    const email = req.nextUrl.searchParams.get("email")

    if (token === null || email === null) {
        return NextResponse.error()
    }

    const { data, error } = await supabase.auth.verifyOtp({ email, type: "recovery", token: token })

    if (error !== null) {
        console.log(error)
        return NextResponse.error()
    }

    return res
}


export { 
    handleRequestToPasswordRecovery
}