"use client"

import { DashboardPageLayout } from "./_components/DashboardPageLayout"
import RecentTransactionSection from "./_components/RecentTransactionsSection"
import SummarySection from "./_components/SummarySection"

export default function DashboardHome() {
	return (
		<DashboardPageLayout title="Home">
			<SummarySection />
			<RecentTransactionSection />
		</DashboardPageLayout>
	)
}
