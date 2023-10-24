import Link from "next/link"
import { Metadata } from "next";

import RegistrationForm from "@/components/RegistrationForm/RegistrationForm"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "FinTrack | Registration"
}

export default function Registration() {
    return (
        <main id={styles["main"]}>
            <div className={styles["outer-container"]}>
                <h2 className={styles["page-title"]}>
                    Let&apos;s start by creating an account.
                </h2>
                <div className={styles["inner-form-container"]}>
                    <RegistrationForm />
                    <div className={styles["to-login-link-container"]}>
                        <span>
                            Already have an account? <Link href="/login" className={styles["to-login-link"]}>Sign in into your account</Link>
                        </span>
                    </div>
                </div>
            </div>
        </main>
    );
}
