import type { Metadata } from "next"
import { inter } from "@/app/fonts"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"

import DataProvider from "@/components/user/DataProvider"

import "@/styles/signup-transitions.css"
import "@/styles/globals.css"

export const metadata: Metadata = {
	description: "An application for tracking your daily transactions."
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<DataProvider>
				<body className={inter.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange
					>
						<main className="min-h-screen">{children}</main>
						<Toaster />
					</ThemeProvider>
					<ReactQueryDevtools initialIsOpen={false} />
				</body>
			</DataProvider>
		</html>
	)
}
