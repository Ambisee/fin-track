"use client"

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { sbBrowser } from "@/lib/supabase";
import Link from "next/link";

export default function SignIn() {
    const origin = window.location.origin

    return (
        <div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
            <div className="w-full max-w-container flex justify-center items-center">
                <Card className="w-[320px]">
                    <CardHeader className="w-full text-center">Sign in back to your account</CardHeader>
                    <CardContent className="w-full grid grid-flow-row gap-4">
                        <Button
                            variant="default"
                            onClick={() => {
                                sbBrowser.auth.signInWithOAuth({
                                    provider: "google",
                                    options: {
                                        redirectTo: `${origin}/auth/login-callback`,
                                    }
                                })
                            }}
                        >
                            Sign in with Google
                        </Button>
                        <Separator 
                            className="my-4 relative after:content-['OR'] after:px-4 after:absolute after:bg-background 
                            after:top-1/2 after:left-1/2 after:translate-x-[-50%] after:translate-y-[-50%]"
                        />
                        <Button variant="ghost">
                            <Link href="/sign-in/email">Sign in with Email</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}