import { Metadata } from "next"
import ForgotPassword from "./page.client"

export const metadata: Metadata = {
	title: "Forgot Password - FinTrack"
}

export default function Page() {
	return <ForgotPassword />
}
