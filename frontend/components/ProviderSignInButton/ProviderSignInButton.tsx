import { HTMLProps, ReactNode } from "react"

import styles from "./ProviderSignInButton.module.css"

interface ProviderSignInButtonProps extends HTMLProps<HTMLButtonElement> {
    imageElement?: ReactNode
}

export default function ProviderSignInButton(props: ProviderSignInButtonProps) {
    return (
        <button onClick={props.onClick} className={`${props.className} ${styles["provider-sign-in-button"]}`}>
            {props.imageElement &&
                <span className={`${styles["provider-icon-wrapper"]}`}>
                    {props.imageElement}
                </span>
            }
                <div className={styles["button-text"]}>{props.children}</div>
        </button>
    )
}