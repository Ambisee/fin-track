"use client"


import { ButtonHTMLAttributes, DetailedHTMLProps } from "react"

import styles from "./NavTogglerButton.module.css"

interface NavTogglerButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {

}

export default function NavTogglerButton(props: NavTogglerButtonProps) {
    return (
        <button 
            {...props}
            onClick={props.onClick}
            className={`
                ${styles["button-element"]} 
                ${props.className}
            `}
        >
            <div className={styles["line"]}></div>
            <div className={styles["line"]}></div>
            <div className={styles["line"]}></div>
        </button>
    )
}