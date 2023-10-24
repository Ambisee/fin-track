import { sbKey, sbURL } from '@/supabase/constants'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const supabase = createRouteHandlerClient({ cookies }, {
        supabaseKey: sbKey,
        supabaseUrl: sbURL
    })
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')

    if (code) {
        await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`))
}