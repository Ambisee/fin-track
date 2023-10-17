/* eslint-disable @next/next/no-before-interactive-script-outside-document */
"use client"

import { ReactNode } from "react"
import Script from "next/script"
import { Raleway } from "next/font/google"
import ThemeProvider from "@/components/ThemeProvider/ThemeProvider"

import "./globals.css"

interface GlobalLayoutProps {
    children: ReactNode
}

export const raleway = Raleway({
    subsets: ["latin"]
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
            <script dangerouslySetInnerHTML={{__html: themeScript}} /> {/* WARNING - dangerouslySetInnerHTML on a <script> tag */}
        </head>
        <body   
            className={`
                ${raleway.className}
            `}
        >
            <ThemeProvider>
                <div id="inner-body-wrapper">
                {children}
                </div>
            </ThemeProvider>
        </body>
    </html>
  )
}
