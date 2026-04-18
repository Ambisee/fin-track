import { DialogTrigger } from "@/components/ui/dialog"
import { useSettingsQuery } from "@/lib/queries"

export default function LedgerBadge() {
	const settingsQuery = useSettingsQuery()

	if (settingsQuery.isLoading || !settingsQuery.isFetchedAfterMount) {
		return undefined
	}

	return (
		<DialogTrigger asChild>
			<button className="absolute top-[38px] right-4">
				<span className="w-full text-sm bg-secondary text-secondary-foreground rounded-full py-1 px-6">
					{settingsQuery.data?.ledger?.name}
				</span>
			</button>
		</DialogTrigger>
	)
}
