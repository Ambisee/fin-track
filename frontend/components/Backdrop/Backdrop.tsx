import useGlobalStore from "@/hooks/useGlobalStore"

import styles from "./Backdrop.module.css"
import { useCallback, useEffect, useRef } from "react"

export default function Backdrop() {
    const ref = useRef<HTMLDivElement>(null)
    const isBackdropVisible = useGlobalStore(state => state.isBackdropVisible)
    const closeBackdropCallbacks = useGlobalStore(state => state.closeBackdropCallbacks)
    
    const toggleBackdrop = useGlobalStore(state => state.toggleBackdrop)
    const clearBackdropCallback = useGlobalStore(state => state.clearBackdropCallback)

    const closeBackdrop = useCallback(() => {
        toggleBackdrop(false)
        for (const callback of closeBackdropCallbacks) {
            callback()
        }
        clearBackdropCallback()
    }, [toggleBackdrop, closeBackdropCallbacks, clearBackdropCallback])
    
    useEffect(() => {
        if (isBackdropVisible) {
            ref.current?.focus()
        }
    }, [isBackdropVisible])

    return (
        <div
            ref={ref}
            tabIndex={0}
            onMouseDown={closeBackdrop}
            onKeyDown={(e) => {
                if (e.key === "Escape") closeBackdrop()
            }}
            className={`
                ${styles["backdrop"]}
                ${isBackdropVisible && styles["show"]}
        `}
    />
    )
}