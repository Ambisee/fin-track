import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { sbServer, supabaseKey, supabaseUrl } from '@/lib/supabase'
import { redirect } from 'next/navigation'

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl
    const code = searchParams.get('code')

    if (code) {
        const cookieStore = cookies()
        const supabase = sbServer(cookieStore)
        
        const { data, error  } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            if (data.user.user_metadata?.username === undefined) {
                await supabase.auth.updateUser({
                    data: {
                        username: data.user.user_metadata.name
                    },
                })
            }

            redirect("/dashboard")
        }
    }

    // return the user to an error page with instructions
    redirect("/auth/error-code")
}