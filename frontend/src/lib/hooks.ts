import { useEffect, useRef } from "react";

function useSetElementWindowHeight() {
    const elementRef = useRef<HTMLDivElement>(null!)

    useEffect(() => {
            const resizeObserver = new ResizeObserver((entries) => {
                if (elementRef.current === undefined || elementRef.current === null) {
                    return
                }
    
                elementRef.current.style.minHeight = `${window.innerHeight}px`
            })
    
            resizeObserver.observe(document.body)
    
            return () => {
                resizeObserver.disconnect()
            }
    }, [elementRef])

    return elementRef
}

export { useSetElementWindowHeight };

