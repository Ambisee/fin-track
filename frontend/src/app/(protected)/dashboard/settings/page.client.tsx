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
			</div>
			<GeneralSection />
			<AccountSection />
			<MailingSection />
			<MiscellaneousSection />
		</div>
	)
}
