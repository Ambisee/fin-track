"use client"

import Link from "next/link"
import { Session, User, UserResponse } from "@supabase/supabase-js"

import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
	NavigationMenu,
	NavigationMenuList,
	NavigationMenuItem,
	NavigationMenuLink
} from "@/components/ui/navigation-menu"
import { useEffect, useState } from "react"
import { sbBrowser } from "@/lib/supabase"
import { useToast } from "../ui/use-toast"

interface PublicNavbarProps {
	user: User | null
}

export default function PublicNavbar(props: PublicNavbarProps) {
	const { toast } = useToast()
	const [user, setUser] = useState(props.user)

	useEffect(() => {
		const authSubscription = sbBrowser.auth.onAuthStateChange(
			async (event, session) => {
				if (
					event === "SIGNED_IN" ||
					event == "SIGNED_OUT" ||
					event === "INITIAL_SESSION"
				) {
					const userResponse = await sbBrowser.auth.getUser()
					setUser(userResponse.data.user)
				}
			}
		)

		return () => {
			authSubscription.data.subscription.unsubscribe()
		}
	}, [toast])

	const linkObject = {
		text: "Sign In",
		redirectUrl: "/sign-in"
	}

	if (user !== null) {
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
