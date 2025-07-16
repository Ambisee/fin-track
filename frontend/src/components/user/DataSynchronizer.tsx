import { LocalDataHelper } from "@/lib/helper/LocalDataHelper"
import { QueryHelper } from "@/lib/helper/QueryHelper"
import { useUserQuery } from "@/lib/hooks"
import { sbBrowser } from "@/lib/supabase"
import { isNonNullable } from "@/lib/utils"
import { Entry, Statistic } from "@/types/supabase"
import {
	RealtimeChannelOptions,
	RealtimePostgresChangesFilter,
	RealtimePostgresDeletePayload,
	RealtimePostgresInsertPayload,
	RealtimePostgresUpdatePayload
} from "@supabase/supabase-js"
import { useQueryClient } from "@tanstack/react-query"
import { useEffect, useState } from "react"

export default function DataSynchronizer() {
	const user = useUserQuery()
	const queryClient = useQueryClient()

	useEffect(() => {
		const userId = user?.data?.id
		if (!userId) {
			console.log("No user")
			return
		}

		const subscription = sbBrowser
			.channel("entry-data-synchronizer")
			.on(
				"postgres_changes",
				{
					event: "INSERT",
					schema: "public",
					table: "entry",
					filter: `created_by=eq.${userId}`
				},
				(payload: RealtimePostgresInsertPayload<Entry>) => {
					console.log(payload)
					const entry = payload.new
					const entryDate = new Date(entry.date)

					const entryQueryKey = QueryHelper.getEntryQueryKey(
						entry.ledger,
						entryDate
					)
					const statsQueryKey = QueryHelper.getStatisticQueryKey(
						entry.ledger,
						entryDate
					)

					queryClient.setQueryData(
						entryQueryKey,
						(data: Entry[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.insertEntry(data, entry)
								: data
						}
					)
					queryClient.setQueryData(
						statsQueryKey,
						(data: Statistic[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.addToStatistic(data, entry)
								: data
						}
					)
				}
			)
			// .on(
			// 	"postgres_changes",
			// 	{
			// 		event: "DELETE",
			// 		schema: "public",
			// 		table: "entry",
			// 		filter: `created_by=eq.${userId}`
			// 	},
			// 	async (payload: RealtimePostgresDeletePayload<Entry>) => {
			//         const id = payload.old.id

			// 		const entryDate = new Date(entry.date)
			// 		const entryQueryKey = QueryHelper.getEntryQueryKey(
			// 			entry.ledger,
			// 			entryDate
			// 		)
			// 		const statsQueryKey = QueryHelper.getStatisticQueryKey(
			// 			entry.ledger,
			// 			entryDate
			// 		)

			// 		queryClient.setQueryData(entryQueryKey, (data: Entry[]) => {
			// 			return LocalDataHelper.deleteEntry(data, entry)
			// 		})
			// 		queryClient.setQueryData(statsQueryKey, (data: Statistic[]) => {
			// 			return LocalDataHelper.deleteFromStatistic(data, entry)
			// 		})
			// 	}
			// )
			.on(
				"postgres_changes",
				{
					event: "UPDATE",
					schema: "public",
					table: "entry",
					filter: `created_by=eq.${userId}`
				},
				async (payload: RealtimePostgresUpdatePayload<Entry>) => {
					const oldEntry = payload.old as Entry
					const newEntry = payload.new as Entry

					const oldEntryDate = new Date(oldEntry.date)
					const newEntryDate = new Date(newEntry.date)

					const oldEntryQueryKey = QueryHelper.getEntryQueryKey(
						oldEntry.ledger,
						oldEntryDate
					)
					const oldStatsQueryKey = QueryHelper.getStatisticQueryKey(
						oldEntry.ledger,
						oldEntryDate
					)
					const newEntryQueryKey = QueryHelper.getEntryQueryKey(
						newEntry.ledger,
						newEntryDate
					)
					const newStatsQueryKey = QueryHelper.getStatisticQueryKey(
						newEntry.ledger,
						newEntryDate
					)

					queryClient.setQueryData(
						oldEntryQueryKey,
						(data: Entry[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.deleteEntry(data, oldEntry)
								: data
						}
					)
					queryClient.setQueryData(
						oldStatsQueryKey,
						(data: Statistic[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.deleteFromStatistic(data, oldEntry)
								: data
						}
					)
					queryClient.setQueryData(
						newEntryQueryKey,
						(data: Entry[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.insertEntry(data, newEntry)
								: data
						}
					)
					queryClient.setQueryData(
						newStatsQueryKey,
						(data: Statistic[] | undefined) => {
							return isNonNullable(data)
								? LocalDataHelper.addToStatistic(data, newEntry)
								: data
						}
					)
				}
			)
			.subscribe()

		return () => {
			subscription.unsubscribe()
		}
	}, [queryClient, user?.data?.id])

	return null
}
