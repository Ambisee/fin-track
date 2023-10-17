"use client"

import { createContext, useState, useEffect, ReactNode, SetStateAction } from "react";

type Theme = "dark-theme" | "light-theme"
interface ThemeContextObject {
    theme: Theme,
    setTheme: (t: Theme) => void
}

interface ThemeProviderProps {
    children: ReactNode
}

const ThemeContext = createContext<ThemeContextObject>({} as ThemeContextObject)

export default function ThemeProvider({children}: ThemeProviderProps) {
    const [themeState, setThemeState] = useState<Theme>("dark-theme")

    useEffect(() => {
        const storageValue = localStorage.getItem("theme")

        if (storageValue == null) {
            return;
        }

        document.documentElement.setAttribute("data-theme", storageValue)
    }, [themeState])
    
    const setTheme = (theme: Theme) => {
        localStorage.setItem("theme", theme)
        setThemeState(theme)
    }

    return (
        <ThemeContext.Provider value={{theme: themeState, setTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export {ThemeContext, ThemeContextObject}