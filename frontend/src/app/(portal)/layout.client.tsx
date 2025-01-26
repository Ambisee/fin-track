"use client"

import { AlertDialog, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Cross1Icon } from "@radix-ui/react-icons"
import Cookies from "js-cookie"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface PortalLayoutProps {
	children: JSX.Element
}

interface CloseButtonProps {
	children: JSX.Element
	isTrigger?: boolean
}

function CloseButton(props: CloseButtonProps) {
	if (props.isTrigger) {
		return (
			<AlertDialogTrigger asChild>
				<Button
					variant="ghost"
					className="absolute top-2 right-2 md:top-4 md:right-4 aspect-square h-10 p-0"
				>
					{props.children}
				</Button>
			</AlertDialogTrigger>
		)
	}

	return (
		<Button
			variant="ghost"
			className="absolute top-4 right-4 md:top-4 md:right-4 aspect-square h-10 p-0"
		>
			<Link
				onClick={() => {
					Cookies.remove("reg-email")
					Cookies.remove("reg-username")
					Cookies.remove("reg-password")
				}}
				href="/"
			>
				{props.children}
			</Link>
		</Button>
	)
}

export default function PortalLayout(props: PortalLayoutProps) {
	const router = useRouter()
	const pathname = usePathname()

	return (
		<AlertDialog>
			{!pathname.startsWith("/recovery") && (
				<div>
					<CloseButton isTrigger={false}>
						<Cross1Icon width={24} height={24} />
					</CloseButton>
				</div>
			)}
			{props.children}
		</AlertDialog>
	)
}
