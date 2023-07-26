"use client"

import { Raleway } from "next/font/google";

import ThemeContextProvider from "@/components/ThemeContextProvider/ThemeContextProvider";

import "./globals.css"

interface GlobalLayoutProps {
    children: React.ReactNode
}

const raleway = Raleway({
    subsets: ["latin"]
})

const GlobalLayout: React.FC<GlobalLayoutProps> = ({
    children
}) => {
    return (
        <html lang="en">
            <body 
                className={`
                    ${raleway.className}
                `}
            >
                <div id="inner-body-wrapper">
                    <ThemeContextProvider>
                        {children}
                    </ThemeContextProvider>
                </div>
            </body>
        </html>
    )
}

export default GlobalLayout;