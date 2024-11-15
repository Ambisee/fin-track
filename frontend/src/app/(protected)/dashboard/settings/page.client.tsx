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
			<h1 className="text-3xl mb-4">Settings</h1>
			<GeneralSection
				key={userSettingsQuery.data?.data?.currency?.currency_name}
			/>
			<AccountSection />
			<MailingSection />
			<MiscellaneousSection />
		</div>
	)
}
