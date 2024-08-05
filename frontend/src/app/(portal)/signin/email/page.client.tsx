"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EmailSignInForm from "@/components/user/EmailSignInForm"
import { Separator } from "@/components/ui/separator"

export default function SignInEmail() {
	return (
		<div className="w-full min-h-svh grid grid-flow-col-dense justify-items-center">
			<div className="px-3 w-full max-w-container h-full flex justify-center items-center">
				<Card className="w-full max-w-[360px] grid grid-flow-row">
					<CardHeader>Sign in with your email</CardHeader>
					<CardContent className="grid grid-flow-row gap-4">
						<EmailSignInForm />
						<Separator className="mt-4 relative" />
						<div className="text-center text-sm">
							<Button asChild variant="link">
								<Link href="/signin">Sign in with another method</Link>
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}