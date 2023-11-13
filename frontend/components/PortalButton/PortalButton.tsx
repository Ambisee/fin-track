import { HTMLProps, DetailedHTMLProps, ButtonHTMLAttributes } from "react"

import styles from "./PortalButton.module.css"

interface PortalButtonProps extends DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> {}

export default function PortalButton(props: PortalButtonProps) {   
    return (
        <button 
            type={props.type} 
            onClick={props.onClick} 
            className={`
                ${styles["portal-button"]} 
                ${props.className}
            `}
        >
            {props.children}
        </button>
    )   
}