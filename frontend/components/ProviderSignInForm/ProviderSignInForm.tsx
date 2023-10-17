"use client"

import BaseSignInForm from "../BaseSignInForm/BaseSignInForm"
import ProviderSignInButton from "../ProviderSignInButton/ProviderSignInButton"

import styles from "./ProviderSignInForm.module.css"

export default function ProviderSignInForm() {
    return (
        <BaseSignInForm title="Sign in with a provider">
            <div className={styles["button-container"]}>
                <ProviderSignInButton
                    imgSrc="/google-icon.svg"
                >
                    Sign in with Google
                </ProviderSignInButton>
            </div>
        </BaseSignInForm>
    )
}