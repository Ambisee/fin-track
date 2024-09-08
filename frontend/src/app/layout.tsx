import { inter } from "@/app/fonts"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import type { Metadata } from "next"

import DataProvider from "@/components/user/DataProvider"
import "./globals.css"

export const metadata: Metadata = {
	title: "FinTrack Prototype",
	description: ""
}

export default function RootLayout({
	children
}: Readonly<{
	children: React.ReactNode
}>) {
	return (
		<html lang="en" className="overscroll-none" suppressHydrationWarning>
			<DataProvider>
				<body className={`${inter.className} bg-black`}>
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
