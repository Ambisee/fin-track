"use client"

import { useSetElementWindowHeight } from "@/lib/hooks"

export default function Template(props: { children: JSX.Element }) {
	const rootRef = useSetElementWindowHeight()

	return (
		<div ref={rootRef} className="min-h-screen bg-background">
			{props.children}
		</div>
	)
}
