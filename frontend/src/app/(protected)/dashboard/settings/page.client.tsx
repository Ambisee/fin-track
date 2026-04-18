"use client"

import { DashboardPageLayout } from "../_components/DashboardPageLayout"
import AccountSection from "./_components/AccountSection/AccountSection"
import GeneralSection from "./_components/GeneralSection/GeneralSection"
import MailingSection from "./_components/MailingSection/MailingSection"
import MiscellaneousSection from "./_components/MiscellaneousSection/MiscellaneousSection"

export default function DashboardSettings() {
	return (
		<DashboardPageLayout title="Settings">
			<GeneralSection />
			<AccountSection />
			<MailingSection />
			<MiscellaneousSection />
		</DashboardPageLayout>
	)
}
