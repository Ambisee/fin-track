import { sbServer } from "@/lib/supabase";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const cookieStore = cookies()
    const supabase = sbServer(cookieStore)

    const payload = await request.json()
    const userReq = await supabase.auth.getUser()
    if (userReq.error !== null) {
        return NextResponse.json(userReq.error, {status: userReq.error.status})
    }

    const session = await supabase.auth.getSession()
    const response = await fetch(`${process.env.NEXT_GENERATE_DOCUMENT_URL}`, {
        method: "POST",
        body: JSON.stringify({
            ledger_id: payload?.ledger_id,
            month: payload?.month,
            year: payload?.year
        }),
        headers: {
            "Authorization": `Bearer ${session.data.session?.access_token}`,
            "Content-Type": "application/json",
        }
    })

    const file = await response.blob()

    return new NextResponse(file, {
        headers: {
            'Content-Type': response.headers.get("Content-Type") as string,
            'Content-Disposition': response.headers.get("Content-Disposition") as string
        }
    })
}