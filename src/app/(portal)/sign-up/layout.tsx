"use client"

import {
	useState,
	createContext,
	Dispatch,
	SetStateAction,
	useEffect
} from "react"
import { useGlobalStore } from "@/lib/store"
import { AnimatePresence } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import Cookies from "js-cookie"
import { usePathname, useRouter } from "next/navigation"

interface SignUpLayoutProps {
	children: JSX.Element
}

interface PageTransitionContextType {
	value: number
	prevPage: number
	setValue: Dispatch<SetStateAction<number>>
	setPrevPage: Dispatch<SetStateAction<number>>
}

// function RenderedPage(props: SignUpLayoutProps) {
//     const router = useRouter()
//     const pathname = usePathname()
// 	const setEmail = useGlobalStore((state) => state.setEmail)
// 	const setUsername = useGlobalStore((state) => state.setUsername)
// 	const setPassword = useGlobalStore((state) => state.setPassword)

//     // Redirect to the email page
//     const emailCookie = Cookies.get("reg-email")
//     if (emailCookie === undefined) {
//         router.replace("/sign-up/email")
//         return
//     }
//     setEmail(emailCookie)

//     // Redirect to username page
//     const usernameCookie = Cookies.get("reg-username")
//     if (usernameCookie === undefined) {
//         router.replace("/sign-up/username")
//         return
//     }
//     setUsername(usernameCookie)

//     // Set password cookie
//     const passwordCookie = Cookies.get("reg-password")
//     if (passwordCookie !== undefined) {
//         setPassword(passwordCookie)
//     }

//     return props.children
// }

export const PageTransitionContext = createContext<PageTransitionContextType>(
	null!
)

function ProgressProvider(props: SignUpLayoutProps) {
	const pathname = usePathname()
	const [value, setValue] = useState(0)
	const [prevPage, setPrevPage] = useState(0)

	useEffect(() => {
		if (pathname.endsWith("/sign-up/email")) {
			setValue(0)
		} else if (pathname.endsWith("/sign-up/username")) {
			setValue(33.3)
		} else if (pathname.endsWith("/sign-up/password")) {
			setValue(66.6)
		}
	}, [pathname, setValue])

	return (
		<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center">
			<div className="w-full max-w-container flex justify-center items-center px-2 md:px-4 overflow-x-hidden">
				<div className="min-h-fit absolute top-1/2 registration-card left-1/2 translate-x-[-50%] translate-y-[calc(-50%-230px)] px-2 md:px-4">
					<Progress className="h-2" value={value} />
				</div>
				<AnimatePresence mode="wait">
					<PageTransitionContext.Provider
						value={{ value, setValue, prevPage, setPrevPage }}
					>
						{props.children}
					</PageTransitionContext.Provider>
				</AnimatePresence>
			</div>
		</div>
	)
}

export default function SignUpLayout(props: SignUpLayoutProps) {
	const router = useRouter()
	const pathname = usePathname()
	const setEmail = useGlobalStore((state) => state.setEmail)
	const setUsername = useGlobalStore((state) => state.setUsername)
	const setPassword = useGlobalStore((state) => state.setPassword)
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		const emailCookie = Cookies.get("reg-email")
		const usernameCookie = Cookies.get("reg-username")

		if (
			(emailCookie === undefined || usernameCookie === undefined) &&
			!pathname.endsWith("/email") &&
			isLoading
		) {
			router.replace("/sign-up/email")
			return
		}

		if (emailCookie !== undefined) setEmail(emailCookie)
		if (usernameCookie !== undefined) setUsername(usernameCookie)

		setIsLoading(false)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	if (isLoading) {
		return (
			<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center px-2 md:px-4">
				<div className="w-full max-w-container flex justify-center items-center px-2 md:px-4">
					<Skeleton className="registration-card" />
				</div>
			</div>
		)
	}

	return <ProgressProvider>{props.children}</ProgressProvider>
}
