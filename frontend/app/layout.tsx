/* eslint-disable @next/next/no-before-interactive-script-outside-document */

import { ReactNode } from "react"
import { Raleway } from "next/font/google"

import ThemeProvider from "@/components/ThemeProvider/ThemeProvider"

import "./globals.css"

interface GlobalLayoutProps {
    children: ReactNode
}

export const raleway = Raleway({
    subsets: ["latin-ext"]
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
        
    }
`

export default function GlobaLayout({
    children
}: GlobalLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script id="get-theme" dangerouslySetInnerHTML={{__html: themeScript}} /> {/* WARNING - dangerouslySetInnerHTML on a <script> tag */}
            </head>
            <body   
                className={`
                    ${raleway.className}
                `}
            >
                <ThemeProvider>
                    {children}
                </ThemeProvider>
            </body>
        </html>
    )
}
