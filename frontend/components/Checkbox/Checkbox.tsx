import { forwardRef, HTMLProps } from "react"

import styles from "./Checkbox.module.css"

interface CheckboxProps extends Omit<HTMLProps<HTMLInputElement>, "type"> {

}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox({
    className,
    ...props
}, ref) {
    return (
        <input 
            ref={ref}
            className={`
                ${styles["select-checkbox"]}
                ${className}
            `}
            type="checkbox" 
            {...props}
        />
    )
})

export default Checkbox
