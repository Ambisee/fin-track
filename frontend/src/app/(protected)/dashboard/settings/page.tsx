"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { sbBrowser } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function DashboardSettings() {
	const router = useRouter()
	const { toast } = useToast()

	return (
		<>
			<div className="w-full min-h-screen">
				<Button
					variant="default"
					onClick={async () => {
						toast({ description: "Loading..." })
						const { error } = await sbBrowser.auth.signOut()

						if (error !== null) {
							toast({ description: error.message })
						}

						router.push("/")
					}}
				>
					Logout
				</Button>
			</div>
		</>
	)
}
