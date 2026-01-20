"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

import Link from "next/link"

import { MailIcon } from "lucide-react"
import LoginWithGoogleButton from "./components/LoginWithGoogleButton"

export default function SignIn() {
	return (
		<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
			<div className="w-full px-4 max-w-container flex justify-center items-center">
				<Card className="max-w-[320px]">
					<CardHeader className="w-full text-center">
						Sign in to your account
					</CardHeader>
					<CardContent className="w-full grid grid-flow-row gap-4">
						<LoginWithGoogleButton />
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
