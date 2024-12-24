import { Metadata } from "next"
import { ReactElement } from "react"

export const metadata: Metadata = {
	title: "Sign In - FinTrack"
}

export default function Layout(props: { children: ReactElement }) {
	return props.children
}
