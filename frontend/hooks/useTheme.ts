"use client"

import { useContext } from "react"

import { ThemeContext, ThemeContextObject } from "@/components/ThemeProvider/ThemeProvider"

function useTheme(): ThemeContextObject {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeContext.")
    }
    return context
}

export default useTheme