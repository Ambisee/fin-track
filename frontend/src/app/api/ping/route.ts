import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {
        await fetch(`${process.env.NEXT_BACKEND_PING_URL}`, {
            signal: AbortSignal.timeout(5000),
            cache: "no-cache"
        })

        return new NextResponse(null, {status: 200})
    } catch (error: unknown) {
        return new NextResponse(null, {status: 500})
    }
}
