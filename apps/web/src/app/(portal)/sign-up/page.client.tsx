"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"

import { MailIcon } from "lucide-react"
import GoogleAuthButton from "../sign-in/(home)/components/LoginWithGoogleButton"

export default function SignUp() {
	return (
		<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
			<div className="w-full max-w-container flex justify-center items-center">
				<Card className="w-[320px]">
					<CardHeader className="w-full text-center">Sign up</CardHeader>
					<CardContent className="w-full grid grid-flow-row gap-4">
						<GoogleAuthButton type="signup" />
						<Link
							href="/sign-up/email"
							className={buttonVariants({ variant: "default" })}
						>
							<MailIcon width={20} height={20} className="mr-2" />
							Sign up with Email
						</Link>
						<Separator className="mt-4 relative" />
						<div className="text-sm w-full text-center">
							<span>Already have an account? </span>
							<br />
							<Button variant="link" className="p-0 m-0 h-fit" asChild>
								<Link href="/sign-in">Sign in</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
