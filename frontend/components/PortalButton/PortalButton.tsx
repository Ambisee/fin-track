import { HTMLProps } from "react"

import styles from "./PortalButton.module.css"

interface PortalButtonProps extends HTMLProps<HTMLButtonElement> {}

export default function PortalButton(props: PortalButtonProps) {   
    return (
        <button onClick={props.onClick} type="button" className={`${styles["portal-button"]} ${props.className}`}>
            {props.children}
        </button>
    )   
}