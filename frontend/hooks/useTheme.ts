"use client"

import { useContext } from "react"

import { ThemeContext, ThemeContextValue } from "@/components/ThemeContextProvider/ThemeContextProvider"

function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeContext.")
    }
    return context
}

export default useTheme