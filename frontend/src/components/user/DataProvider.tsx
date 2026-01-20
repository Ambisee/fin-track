"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, type JSX } from "react"

export default function DataProvider(props: { children: JSX.Element }) {
	const [client] = useState(new QueryClient())

	return (
		<QueryClientProvider client={client}>{props.children}</QueryClientProvider>
	)
}
