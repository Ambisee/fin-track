"use client"

import { User } from "@supabase/supabase-js"
import Link from "next/link"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList
} from "@/components/ui/navigation-menu"
import { sbBrowser } from "@/lib/supabase"
import { useEffect, useState } from "react"

interface PublicNavbarProps {
	user: User | null
}

export default function PublicNavbar(props: PublicNavbarProps) {
	const [isSignedIn, setIsSignedIn] = useState(props.user !== null)

	useEffect(() => {
		const isUserSignedIn = async () => {
			const { data } = await sbBrowser.auth.getUser()
			setIsSignedIn(data.user !== null)
		}

		isUserSignedIn()
	}, [])

	const linkObject = {
		text: "Sign In",
		redirectUrl: "/sign-in"
	}

	if (isSignedIn) {
		linkObject.text = "Dashboard"
		linkObject.redirectUrl = "/dashboard"
	}

	return (
		<div
			className="w-full h-header grid grid-flow-col-dense 
            justify-items-center"
		>
			<div
				className="w-full h-full max-w-container p-4
                flex justify-between items-center"
			>
				<Link href="/" className="px-2 py-1">
					<div className="flex items-center gap-4">
						<Avatar>
							<AvatarFallback>F</AvatarFallback>
						</Avatar>
						<span className="hidden md:block">FinTrack</span>
					</div>
				</Link>
				<NavigationMenu>
					<NavigationMenuList className="gap-4 md:flex">
						<NavigationMenuItem>
							<Link href={linkObject.redirectUrl}>
								<Button variant="link">{linkObject.text}</Button>
							</Link>
						</NavigationMenuItem>
					</NavigationMenuList>
				</NavigationMenu>
			</div>
		</div>
	)
}
