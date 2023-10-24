"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { Roboto } from "next/font/google"

import { sbClient } from "@/supabase/supabase_client"
import BaseFormWrapper from "../BaseFormWrapper/BaseFormWrapper"
import ProviderSignInButton from "../ProviderSignInButton/ProviderSignInButton"

import styles from "./ProviderSignInForm.module.css"

const roboto = Roboto({
    weight: ["300", "400"],
    subsets: ["greek"]
})

export default function ProviderSignInForm() {
    const router = useRouter()

    return (
        <BaseFormWrapper title="Sign in with a provider">
            <div className={styles["button-container"]}>
                <ProviderSignInButton
                    onClick={
                        () => {
                            sbClient.auth.signInWithOAuth({
                                provider: "google",
                                options: {
                                    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/login-callback`,
                                    queryParams: {
                                        access_type: 'offline',
                                        prompt: 'consent'
                                    }
                                }
                            })
                        }
                    }
                    className={`
                        ${styles["provider-button"]}
                        ${styles["google-button"]}
                        ${roboto.className}
                    `}
                    imageElement={
                        <Image 
                            src="/google-icon.svg" 
                            alt="google-icon.svg" 
                            className={styles["google-icon"]}
                            width={24} 
                            height={24} 
                        />
                    }
                >
                    Sign in with Google
                </ProviderSignInButton>
            </div>
        </BaseFormWrapper>
    )
}