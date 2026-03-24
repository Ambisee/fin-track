import SettingsSection from "../SettingsSection"
import EmailChange from "./EmailChange"
import LinkedAccountChange from "./LinkedAccountChange"
import PasswordChange from "./PasswordChange"

export default function AccountSection() {
	return (
		<SettingsSection name="Account">
			<>
				<LinkedAccountChange />
				<EmailChange />
				<PasswordChange />
			</>
		</SettingsSection>
	)
}
