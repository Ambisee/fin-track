import Link from "next/link"
import { Metadata } from "next"

import ForgotPasswordForm from "@/components/ForgotPasswordForm/ForgotPasswordForm"
import { LOGIN_PAGE_URL } from "@/helpers/url_routes"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "FinTrack | Forgot Password"
}

export default function ForgotPassword() {
  return (
    <main id={styles["main"]}>
        <div className={styles["outer-form-container"]}>
            <h2 className={styles["page-title"]}>Enter your email address to reset your password.</h2>
            <div className={styles["inner-form-container"]}>
                <ForgotPasswordForm />
                <div className={styles["to-login-link-container"]}>
                    <span>
                        Remembered your password? &nbsp;
                        <Link className={styles["to-login-link"]} href={LOGIN_PAGE_URL}>
                            Sign in to your account
                        </Link>
                    </span>
                </div>
            </div>
        </div>
    </main>
  )
}
