"use client"

import { sbBrowser } from "@/lib/supabase"
import Image from "next/image"

import googleIcon from "@/../public/google-icon.svg"
import { roboto } from "@/app/fonts"
import { Button } from "@/components/ui/button"

interface GoogleAuthButtonProps {
	type?: "signup" | "signin"
}

export default function GoogleAuthButton(props: GoogleAuthButtonProps) {
	const { type = "signin", ...restProps } = props

	return (
		<Button
			variant="default"
			className={roboto.className}
			onClick={() => {
				sbBrowser.auth.signInWithOAuth({
					provider: "google",
					options: {
						redirectTo: `${window.location.origin}/auth/login-callback`
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
				preload
			/>
			Sign {type === "signin" ? "in" : "up"} with Google
		</Button>
	)
}
