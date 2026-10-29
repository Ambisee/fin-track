import SettingsSection from "../SettingsSection"
import MonthEndReport from "./MonthEndReport"
import Documents from "./Documents"

export default function MailingSection() {
	return (
		<SettingsSection name="Mailing">
			<>
				<MonthEndReport />
				<Documents />
			</>
		</SettingsSection>
	)
}
