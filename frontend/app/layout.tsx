/* eslint-disable @next/next/no-before-interactive-script-outside-document */

import { ReactNode } from "react"
import { Raleway } from "next/font/google"

import ThemeProvider from "@/components/ThemeProvider/ThemeProvider"

import "./globals.css"

interface GlobalLayoutProps {
    children?: ReactNode
}

export const raleway = Raleway({
    subsets: ["latin-ext"],
    weight: ["300", "400", "500", "700"]
})

// Script to retrieve the theme from the localStorage first
const themeScript = `
    const theme = localStorage.getItem('theme')

    if (theme === null) {
        document.documentElement.setAttribute("data-theme", "dark-theme");
    }
    else if (["dark-theme", "light-theme"].includes(theme)) {
        document.documentElement.setAttribute("data-theme", theme);
    }
    else {
        document.documentElement.setAttribute("data-theme", "dark-theme");   
    }
`

export default function GlobaLayout({
    children
}: GlobalLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body   
                className={`
                    ${raleway.className}
                `}
            >
                <script id="get-theme" dangerouslySetInnerHTML={{__html: themeScript}} /> {/* WARNING - dangerouslySetInnerHTML on a <script> tag */}
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
