import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { USER_QKEY } from "@/lib/constants"
import { useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { Provider } from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"

import Image from "next/image"

import googleIcon from "../../../../../../../public/google-icon.svg"
import { Label } from "@/components/ui/label"

export default function LinkedAccountChange() {
	const { toast } = useToast()
	const userQuery = useUserQuery()
	const queryClient = useQueryClient()

	const getIdentityProviders = () => {
		const result = new Set()
		const identities = userQuery.data?.identities
		if (identities === undefined) {
			return result
		}

		for (const identity of identities) {
			result.add(identity.provider)
		}

		return result
	}

	const renderButton = (provider: string) => {
		if (userQuery.data?.identities === undefined) {
			return undefined
		}

		const identityProviders = getIdentityProviders()
		if (identityProviders.has(provider)) {
			const identity = userQuery.data?.identities.find(
				(value) => value.provider === provider
			)

			if (identity === undefined) {
				return undefined
			}

			return (
				<Button
					variant="outline"
					disabled={identityProviders.size === 1}
					onClick={async (e) => {
						e.preventDefault()
						const { error } = await sbBrowser.auth.unlinkIdentity(identity)

						if (error !== null) {
							toast({
								description: error.message,
								variant: "destructive"
							})
							return
						}

						queryClient.invalidateQueries({ queryKey: USER_QKEY })
					}}
				>
					Unlink
				</Button>
			)
		}

		return (
			<Button
				variant="default"
				onClick={async (e) => {
					e.preventDefault()
					const { error } = await sbBrowser.auth.linkIdentity({
						provider: provider as Provider,
						options: {
							redirectTo: `${window.location.origin}/dashboard/settings`
						}
					})

					if (error !== null) {
						toast({
							description: error.message,
							variant: "destructive"
						})
						return
					}

					queryClient.invalidateQueries({ queryKey: USER_QKEY })
				}}
			>
				Link Account
			</Button>
		)
	}

	return (
		<div className="mt-2">
			<Label>Linked Accounts</Label>
			<ul className="mt-2">
				<li className="rounded-md border p-4">
					<div className="flex justify-between">
						<div className="flex items-center gap-3">
							<span className="w-10 h-10 flex justify-center items-center bg-white rounded-sm">
								<Image
									src={googleIcon}
									alt="Google Icon.svg"
									width={24}
									height={24}
								/>
							</span>
							<p className="text-sm">Google</p>
						</div>
						{userQuery.isLoading ? (
							<Skeleton className="w-20 h-10" />
						) : (
							renderButton("google")
						)}
					</div>
				</li>
			</ul>
		</div>
	)
}
