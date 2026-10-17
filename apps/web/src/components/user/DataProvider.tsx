"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState, ReactNode } from "react"

export default function DataProvider(props: { children: ReactNode }) {
	const [client] = useState(new QueryClient())

	return (
		<QueryClientProvider client={client}>{props.children}</QueryClientProvider>
	)
}
