import { HTMLProps, DetailedHTMLProps, ButtonHTMLAttributes } from "react"

import styles from "./ActionButton.module.css"

interface ActionButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export default function ActionButton(props: ActionButtonProps) {   
    return (
        <button 
            type={props.type} 
            onClick={props.onClick} 
            className={`
                ${styles["action-button"]} 
                ${props.className}
            `}
        >
            {props.children}
        </button>
    )   
}