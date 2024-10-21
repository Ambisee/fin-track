"use client"

import { buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useSetElementWindowHeight } from "@/lib/hooks"
import { AnimatePresence, motion } from "framer-motion"
import Cookies from "js-cookie"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
	createContext,
	Dispatch,
	SetStateAction,
	useEffect,
	useState
} from "react"

export type EmailSignupPaths =
	| "/sign-up/email"
	| "/sign-up/username"
	| "/sign-up/password"

interface SignUpLayoutProps {
	children: JSX.Element
}

interface PageTransitionContextType {
	prevPage: number
	setPrevPage: Dispatch<SetStateAction<number>>
}

export const PageTransitionContext = createContext<PageTransitionContextType>(
	null!
)

export const pageIndexMap = new Map<EmailSignupPaths, number>([
	["/sign-up/email", 0],
	["/sign-up/username", 1],
	["/sign-up/password", 2]
])

function ProgressProvider(props: SignUpLayoutProps) {
	const pathname = usePathname()
	const rootRef = useSetElementWindowHeight()
	const [prevPage, setPrevPage] = useState(
		pageIndexMap.get(pathname as EmailSignupPaths) ?? -1
	)

	let progressValue = pageIndexMap.get(pathname as EmailSignupPaths) ?? -1
	if (pathname.endsWith("/sign-up/email")) {
		progressValue = 0
	} else if (pathname.endsWith("/sign-up/username")) {
		progressValue = 33.3
	} else if (pathname.endsWith("/sign-up/password")) {
		progressValue = 66.6
	}

	return (
		<div
			ref={rootRef}
			className="w-full grid grid-flow-col-dense justify-items-center"
		>
			<div className="w-full h-full max-w-container flex justify-center items-center px-2 overflow-x-hidden">
				<div className="min-h-fit w-full max-w-[375px] px-0 md:px-0">
					<div className="w-full px-2 mb-4">
						<Progress className="h-[2px] w-full" value={progressValue} />
					</div>
					<PageTransitionContext.Provider
						value={{
							prevPage,
							setPrevPage
						}}
					>
						<Card className="flex flex-col justify-between registration-card">
							<motion.div
								className="overflow-hidden max-w-[375px]"
								layout
								layoutRoot
							>
								<AnimatePresence>{props.children}</AnimatePresence>
							</motion.div>
							<div className="w-full px-6 pb-6 flex flex-col gap-6 justify-end items-center">
								<Separator className="w-full" />
								<div>
									<Link
										href="/sign-up"
										className={buttonVariants({ variant: "link" })}
									>
										Sign up with another method
									</Link>
								</div>
							</div>
						</Card>
					</PageTransitionContext.Provider>
				</div>
			</div>
		</div>
	)
}

export default function SignUpLayout(props: SignUpLayoutProps) {
	const router = useRouter()
	const pathname = usePathname()
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

		setIsLoading(false)

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pathname])

	if (isLoading) {
		return (
			<div className="w-full min-h-[inherit] grid grid-flow-col-dense justify-items-center px-2 md:px-4">
				<div className="w-full max-w-container flex justify-center items-center px-2 md:px-4">
					<div className="min-h-fit w-full max-w-[375px] px-0 md:px-0">
						<div className="w-full px-2 mb-4">
							<Skeleton className="h-[2px] w-full" />
						</div>
						<Skeleton className="registration-card" />
					</div>
				</div>
			</div>
		)
	}

	return <ProgressProvider>{props.children}</ProgressProvider>
}
