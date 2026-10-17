import { Metadata } from "next"
import { ReactNode } from "react"

export const metadata: Metadata = {
	title: "Sign In - FinTrack"
}

export default function Layout(props: { children: ReactNode }) {
	return props.children
}
