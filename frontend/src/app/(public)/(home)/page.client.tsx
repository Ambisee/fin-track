"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function HomePage() {
	return (
		<div className="px-6 max-w-container h-full relative mx-auto flex justify-center items-center md:px-0">
			<div className="grid gap-8 translate-y-[-5rem]">
				<h1 className="max-w-3/4 text-4xl sd:max-w-none">
					<b>FinTrack</b> helps track your finances.
				</h1>
				<div className="w-full flex sm:justify-center sm:items-center">
					<Button asChild variant="default" className="w-1/2">
						<Link href="/sign-in">Get Started</Link>
					</Button>
				</div>
			</div>
		</div>
	)
}
