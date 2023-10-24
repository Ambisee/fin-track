import { ReactNode } from "react"

import styles from "./BaseFormWrapper.module.css"

interface BaseFormWrapperProps {
    children?: ReactNode,
    title?: string
}

export default function BaseFormWrapper(props: BaseFormWrapperProps) {
return (
        <div className={styles["container"]}>
            {props.title && 
                <h6 className={styles["title"]}>
                    <u>{props.title}</u>
                </h6>
            }
            {props.children}
        </div>
    )
}