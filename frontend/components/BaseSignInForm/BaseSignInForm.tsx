import { ReactNode } from "react"

import styles from "./BaseSignInForm.module.css"

interface BaseSignInFormProps {
    children?: ReactNode,
    title: string
}

export default function BaseSignInForm(props: BaseSignInFormProps) {
    return (
        <div className={styles["container"]}>
            <h6 className={styles["title"]}>
                <u>{props.title}</u>
            </h6>
            {props.children}
        </div>
    )
}