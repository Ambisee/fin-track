import { HTMLProps } from "react"

import styles from "./Checkbox.module.css"

interface CheckboxProps extends Omit<HTMLProps<HTMLInputElement>, "type"> {

}

export default function Checkbox({
    className,
    ...props
}: CheckboxProps) {
    return (
        <input 
            className={`
                ${styles["select-checkbox"]}
                ${className}
            `}
            type="checkbox" 
            {...props}
        />
    )
}