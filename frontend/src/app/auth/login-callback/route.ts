import { sbServer } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

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