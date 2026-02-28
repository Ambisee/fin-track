import PublicNavbar from "@/components/user/PublicNavbar"
import { sbServer } from "@/lib/supabase"
import { cookies } from "next/headers"
import { ReactNode } from "react"

interface PublicLayoutProps {
	children: ReactNode
}

export default async function PublicLayout(props: PublicLayoutProps) {
	const cookieStore = await cookies()
	const supabase = sbServer(cookieStore)

	const userResponse = await supabase.auth.getUser()

	return (
		<>
			<PublicNavbar user={userResponse.data.user} />
			<div className="h-0 min-h-[calc(100vh-80px)]">{props.children}</div>
		</>
	)
}
