"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import EntryList from "@/components/user/EntryList"
import { MONTHS } from "@/lib/constants"
import { DateHelper } from "@/lib/helper/DateHelper"
import { useEntryDataQuery, useSettingsQuery } from "@/lib/queries"
import { isNonNullable } from "@/lib/utils"
import { DashboardPageLayout } from "./_components/DashboardPageLayout"
import SummarySection from "./_components/SummarySection"
import RecentTransactionSection from "./_components/RecentTransactionsSection"

export default function DashboardHome() {
	return (
		<DashboardPageLayout title="Home">
			<SummarySection />
			<RecentTransactionSection />
		</DashboardPageLayout>
	)
}
