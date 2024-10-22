import SettingsSection from "../SettingsSection"
import AutomaticMonthlyReport from "./AutomaticMonthlyReport"
import Documents from "./Documents"

export default function MailingSection() {
	return (
		<SettingsSection name="Mailing">
			<>
				<AutomaticMonthlyReport />
				<Documents />
			</>
		</SettingsSection>
	)
}
