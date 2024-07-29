"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import EmailSignInForm from "@/components/user/EmailSignInForm"
import Link from "next/link"

export default function EmailSignIn() {
	return (
		<div className="w-full min-h-svh grid grid-flow-col-dense justify-items-center">
			<div className="px-3 w-full max-w-container h-full flex justify-center items-center">
				<Card className="w-full max-w-[360px] grid grid-flow-row">
					<CardHeader>Sign in with your email</CardHeader>
					<CardContent>
						<EmailSignInForm />
					</CardContent>
					<CardFooter className="grid grid-flow-row gap-2">
						<Button variant="ghost">
							<Link href="/sign-up/email">Create an account</Link>
						</Button>
						<Button variant="ghost">
							<Link href="/sign-in">Sign in with third-party providers</Link>
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}
