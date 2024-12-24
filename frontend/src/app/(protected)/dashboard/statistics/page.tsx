import { Metadata } from "next"
import DashboardStatistics from "./page.client"

export const metadata: Metadata = {
	title: "Statistics - Dashboard - FinTrack"
}

export default function Page() {
	return <DashboardStatistics />
}
