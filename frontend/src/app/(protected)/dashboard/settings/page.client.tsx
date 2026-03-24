"use client"

import AccountSection from "./_components/AccountSection/AccountSection"
import GeneralSection from "./_components/GeneralSection/GeneralSection"
import MailingSection from "./_components/MailingSection/MailingSection"
import MiscellaneousSection from "./_components/MiscellaneousSection/MiscellaneousSection"

export default function DashboardSettings() {
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
