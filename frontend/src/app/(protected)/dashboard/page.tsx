import { Metadata } from "next"
import DashboardHome from "./page.client"

export const metadata: Metadata = {
	title: "Home - Dashboard - FinTrack"
}

export default function Page() {
	return <DashboardHome />
}
