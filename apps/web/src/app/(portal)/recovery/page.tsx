import { Metadata } from "next"
import Recovery from "./page.client"

export const metadata: Metadata = {
	title: "Password Recovery - FinTrack"
}

export default function Page() {
	return <Recovery />
}
