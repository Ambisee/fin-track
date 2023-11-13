import { headers } from "next/headers"

import RecoveryForm from "@/components/RecoveryForm/RecoveryForm"

import styles from "./page.module.css"

export default function Recovery() {
    return (
        <main id={styles["main"]}>
            <div className={styles["outer-form-container"]}>
                <h2 className={styles["page-title"]}>Enter your new password.</h2>
                <div className={styles["inner-form-container"]}>
                    <RecoveryForm />
                </div>
            </div>
        </main>
    )
}