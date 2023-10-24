import { Metadata } from "next"

import styles from "./page.module.css"
import EmailSignInForm from "@/components/EmailSignInForm/EmailSignInForm"
import ProviderSignInForm from "@/components/ProviderSignInForm/ProviderSignInForm";

export const metadata: Metadata = {
    title: "FinTrack | Sign In",
    description: `FinTrack is an application that allows user to record their spendings and earnings.`
}

export default function Login() {
    return (
        <main id={styles["main"]}>
            <div className={styles["login-container"]}>
                <h2 className={styles["login-page-title"]}>Login to your account</h2>
                
                
                <div className={styles["inner-form-container"]}>
                    <div>
                        {/* Email Sign In Form */}
                        <EmailSignInForm />
                        
                        <div className={styles["divider"]}>
                            <hr className={styles["divider-bar"]}></hr>
                            <span className={styles["divider-span"]}>OR</span>
                            <hr className={styles["divider-bar"]}></hr>
                        </div>
                        
                        {/* Provider Sign In Form */}
                        <ProviderSignInForm />
                    </div>
                </div>   
            </div>
        </main>
    );
}
