import { DialogTrigger } from "@/components/ui/dialog"
import { useSettingsQuery } from "@/lib/queries"

export default function LedgerBadge() {
	const settingsQuery = useSettingsQuery()

	if (settingsQuery.isLoading || !settingsQuery.isFetchedAfterMount) {
		return undefined
	}

	return (
		<DialogTrigger asChild>
			<button className="absolute min-w-0 max-w-2/4 top-8.25 right-4 truncate text-sm bg-secondary text-secondary-foreground rounded-full py-1 px-6">
				{settingsQuery.data?.visibleLedger?.name}
			</button>
		</DialogTrigger>
	)
}
