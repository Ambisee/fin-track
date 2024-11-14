"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { sbBrowser } from "@/lib/supabase"
import Image from "next/image"
import Link from "next/link"

import { roboto } from "@/app/fonts"
import googleIcon from "../../../../../public/google-icon.svg"

import { MailIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function SignIn() {
	const [origin, setOrigin] = useState<string>(null!)
	useEffect(() => {
		setOrigin(window.location.origin)
	}, [])

	return (
		<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
			<div className="w-full px-4 max-w-container flex justify-center items-center">
				<Card className="max-w-[320px]">
					<CardHeader className="w-full text-center">
						Sign in to your account
					</CardHeader>
					<CardContent className="w-full grid grid-flow-row gap-4">
						<Button
							variant="default"
							className={roboto.className}
							onClick={() => {
								sbBrowser.auth.signInWithOAuth({
									provider: "google",
									options: {
										redirectTo: `${origin}/auth/login-callback`
									}
								})
							}}
						>
							<Image
								src={googleIcon}
								alt="Google Icon.svg"
								width={20}
								height={20}
								className="mr-2"
							/>
							Sign in with Google
						</Button>
						<Link
							href="/sign-in/email"
							className={buttonVariants({ variant: "default" })}
						>
							<MailIcon width={20} height={20} className="mr-2" />
							Sign in with Email
						</Link>
						<Separator className="mt-4 relative" />
						<div className="text-sm w-full text-center">
							<span>Don&apos;t have an account? </span>
							<Button variant="link" className="p-0 m-0 h-fit" asChild>
								<Link href="/sign-up">Create an account</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
