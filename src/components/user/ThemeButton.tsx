"use client"

import { useTheme } from "next-themes"
import { MoonIcon, SunIcon } from "@radix-ui/react-icons"
import { Button, ButtonProps } from "@/components/ui/button"

export default function ThemeButton({
    onClick,
    className,
    ...props
}: ButtonProps) {
    const { theme, setTheme } = useTheme()
    
    return (
        <Button
            {...props}
            className={`
                ${className}
                aspect-square
                box-border
            `}
            onClick={(e) => {
                onClick?.(e)
                
                const newTheme = (theme === "dark") ? "light" : "dark"
                setTheme(newTheme)
            }}
        >
            <SunIcon className="dark:hidden" />
            <MoonIcon className="dark:block hidden" />
        </Button>
    )
}