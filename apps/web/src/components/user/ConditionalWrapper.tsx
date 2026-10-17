import { ReactNode } from "react"

interface SlotWrapperProps {
	showContent: boolean
	fallback: ReactNode
	children: ReactNode
}

export default function ConditionalWrapper(props: SlotWrapperProps) {
	const { showContent, fallback: fallback, children } = props

	if (!showContent) {
		return fallback
	}

	return children
}
