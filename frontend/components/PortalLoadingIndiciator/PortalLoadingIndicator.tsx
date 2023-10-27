"use client"

import usePortalLoader from "@/hooks/usePortalLoader"

import styles from "./PortalLoadingIndicator.module.css"

export default function PortalLoadingIndicator() {
    const {isLoading} = usePortalLoader()

    if (!isLoading) {
        return <></>
    }

    return (
        <div className={`
            ${styles["container"]}
        `}>
            <span>Loading...</span>
        </div>
    )
}