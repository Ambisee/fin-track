import { Metadata } from "next"
import HomePage from "./page.client"

export const metadata: Metadata = {
	title: "Home - FinTrack"
}

export default function Page() {
	return <HomePage />
}
