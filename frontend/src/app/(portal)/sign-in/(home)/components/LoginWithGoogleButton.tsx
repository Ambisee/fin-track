"use client"

import { sbBrowser } from "@/lib/supabase"
import Image from "next/image"

import { roboto } from "@/app/fonts"
import { Button } from "@/components/ui/button"
import googleIcon from "@/../public/google-icon.svg"
import dynamic from "next/dynamic"

function LoginWithGoogleButton() {
	const origin = window.location.origin

	return (
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
	)
}

export default dynamic(() => Promise.resolve(LoginWithGoogleButton), {
	ssr: false
})
