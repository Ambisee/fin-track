import { Metadata } from "next"
import DashboardSettings from "./page.client"

export const metadata: Metadata = {
	title: "Settings - Dashboard - FinTrack"
}

export default function Page() {
	return <DashboardSettings />
}
