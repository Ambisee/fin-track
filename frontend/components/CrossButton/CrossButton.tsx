"use client"

import { DetailedHTMLProps, ButtonHTMLAttributes } from "react"

import styles from "./CrossButton.module.css"

interface CrossButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {

}

export default function CrossButton(props: CrossButtonProps) {
    return (
        <button onClick={props.onClick} className={`${styles["button-element"]} ${props.className}`}>
            <div className={styles["line"]}></div>
            <div className={styles["line"]}></div>
        </button>
    )
}