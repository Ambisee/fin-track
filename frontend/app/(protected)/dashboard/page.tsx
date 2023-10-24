"use client"

import { useRouter } from "next/navigation"

import { sbClient } from "@/supabase/supabase_client"

export default function Dashboard() {
    const router = useRouter()

    return (
        <>
            This is the dashboard
            <button onClick={() => {
                sbClient.auth.signOut()
                router.push("/")
            }}>
                Sign out
            </button>
        </>
    )
}