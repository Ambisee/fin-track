"use client"

import { forwardRef } from "react"

import styles from "./ThemeSwitchButton.module.css"
import useTheme from "@/hooks/useTheme"

interface ThemeSwitchButtonProps 
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const ThemeSwitchButton = forwardRef<HTMLButtonElement, ThemeSwitchButtonProps>(({
    className,
    ...props
}, ref) => {
    const themeContext = useTheme()

    return (
        <button 
            onClick={() => themeContext.setTheme(themeContext.theme === "dark-theme" ? "light-theme" : "dark-theme")}
            className={`
                ${styles["style-switch-button"]} 
                ${className ?? ""}
            `} 
            {...props}>
            <svg className={styles["style-switch-icon-svg"]} width="171" height="171" viewBox="0 0 171 171" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className={styles["circle"]} cx="85.5" cy="85.5" r="85.5" />
                <path className={styles["left-half"]} fillRule="evenodd" clipRule="evenodd" d="M85.5002 22.4425C85.5001 22.4425 85.5 22.4425 85.4999 22.4425C50.3981 22.4425 21.9424 50.8982 21.9424 86C21.9424 121.102 50.3981 149.558 85.4999 149.558C85.5 149.558 85.5001 149.558 85.5002 149.558V22.4425Z" />
                <path className={styles["right-half"]} fillRule="evenodd" clipRule="evenodd" d="M85 149.557C119.984 149.419 148.301 121.016 148.301 86C148.301 50.9838 119.984 22.5813 85 22.443L85 149.557Z" />
            </svg>
        </button>
    );
})   

ThemeSwitchButton.displayName = "ThemeSwitchButton"
 
export default ThemeSwitchButton;