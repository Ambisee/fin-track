"use client"

import { useContext } from "react"

import { ThemeContext } from "@/components/ThemeProvider/ThemeProvider"

function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeContext.")
    }
    return context
}

export default useTheme