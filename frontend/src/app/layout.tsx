import type { Metadata } from "next"
import { inter } from "@/app/fonts"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"

import "./globals.css"
import DataProvider from "@/components/user/DataProvider"

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
				</body>
			</DataProvider>
		</html>
	)
}
