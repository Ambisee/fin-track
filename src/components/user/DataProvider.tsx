"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

const client = new QueryClient()

export default function DataProvider(props: { children: JSX.Element }) {
	return (
		<QueryClientProvider client={client}>{props.children}</QueryClientProvider>
	)
}
