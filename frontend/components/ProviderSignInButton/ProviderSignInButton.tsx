import Image from "next/image"
import { HTMLProps } from "react"

import styles from "./ProviderSignInButton.module.css"

interface ProviderSignInButtonProps extends HTMLProps<HTMLButtonElement> {
    imgSrc: string
}

export default function ProviderSignInButton(props: ProviderSignInButtonProps) {
    return (
        <button onClick={props.onClick} className={`${props.className} ${styles["provider-sign-in-button"]}`}>
            {props.imgSrc &&
                <span className={styles["provider-icon-wrapper"]}>
                    <Image 
                        className={styles["provider-icon"]} 
                        alt="provider-icon.png" 
                        src={props.imgSrc} 
                        width={35}
                        height={35}
                    />
                </span>
            }
                <div className={styles["button-text"]}>{props.children}</div>
        </button>
    )
}