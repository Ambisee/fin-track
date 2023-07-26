"use client"

import { createContext, useState, useEffect } from "react"

type Theme = "dark-theme" | "light-theme"
interface ThemeContextValue {
    theme: Theme,
    setTheme: (arg0: Theme) => void
}

interface ThemeContextProviderProps {
    children: React.ReactNode
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({
    children
}) => {
    const [themeState, setThemeState] = useState<Theme>("dark-theme")

    useEffect(() => {
        const storedTheme: Theme | null = localStorage.getItem("theme") as Theme | null
        if (storedTheme !== null) {
            setThemeState(storedTheme)
        }

        const body = document.querySelector("body")
        if (body !== null) {
            body.classList.add(themeState)
            body.classList.remove(themeState === "dark-theme" ? "light-theme" : "dark-theme")
        }
        
    }, [themeState])

    const setTheme = (theme: Theme) => {
        setThemeState(theme)
        localStorage.setItem("theme", theme)
    }

    return (
        <ThemeContext.Provider value={{theme: themeState, setTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export default ThemeContextProvider
export type { ThemeContextValue, Theme }
export { ThemeContext }