"use client"

import { useSettingsQuery } from "@/lib/hooks"
import AccountSection from "./components/AccountSection/AccountSection"
import GeneralSection from "./components/GeneralSection/GeneralSection"
import MailingSection from "./components/MailingSection/MailingSection"
import MiscellaneousSection from "./components/MiscellaneousSection/MiscellaneousSection"

export default function DashboardSettings() {
	const userSettingsQuery = useSettingsQuery()

	return (
		<div className="w-full">
			<div className="w-full mb-4 flex justify-between items-center">
				<h1 className="text-3xl">Settings</h1>
				<span className="text-sm mr-4 bg-secondary text-secondary-foreground rounded-full py-0.5 px-6">
					{userSettingsQuery.data?.data?.ledger?.name}
				</span>
			</div>
			<GeneralSection
				key={userSettingsQuery.data?.data?.currency?.currency_name}
			/>
			<AccountSection />
			<MailingSection />
			<MiscellaneousSection />
		</div>
	)
}
