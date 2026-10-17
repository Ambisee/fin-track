import { Metadata } from "next"
import DashboardEntries from "./page.client"

export const metadata: Metadata = {
	title: "Entries - Dashboard - FinTrack"
}

export default function Page() {
	return <DashboardEntries />
}
