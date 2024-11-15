"use client"

import SettingsSection from "../SettingsSection"
import CategoriesEditor from "./CategoriesEditor"
import CurrencyChange from "./CurrencyChange"
import LedgersEditor from "./LedgersEditor"
import UsernameChange from "./UsernameChange"

export default function GeneralSection() {
	return (
		<SettingsSection name="General">
			<>
				<UsernameChange />
				<CurrencyChange />
				<CategoriesEditor />
				<LedgersEditor />
			</>
		</SettingsSection>
	)
}
