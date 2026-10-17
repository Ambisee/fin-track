import { Metadata } from "next"
import SignUp from "./page.client"

export const metadata: Metadata = {
	title: "Sign Up - FinTrack"
}

export default function Page() {
	return <SignUp />
}
