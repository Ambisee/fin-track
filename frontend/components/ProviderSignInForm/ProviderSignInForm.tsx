"use client"

import Image from "next/image"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Roboto } from "next/font/google"

import { supabase } from "@/supabase/initialize_supabase"
import { getURL } from "@/helpers/getUrl"
import BaseSignInForm from "../BaseSignInForm/BaseSignInForm"
import ProviderSignInButton from "../ProviderSignInButton/ProviderSignInButton"

import styles from "./ProviderSignInForm.module.css"

const roboto = Roboto({
    weight: ["300", "400"],
    subsets: ["greek"]
})

export default function ProviderSignInForm() {
    const router = useRouter()
    
    useEffect(() => {
        async function foo() {
            const user = await supabase.auth.getUser()
            console.log(user)
        }
        foo()
    }, [])

    return (
        <BaseSignInForm title="Sign in with a provider">
            <div className={styles["button-container"]}>
                <ProviderSignInButton
                    onClick={
                        () => {
                            supabase.auth.signInWithOAuth({
                                provider: "google",
                                options: {
                                    redirectTo: getURL("/register")
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
        </BaseSignInForm>
    )
}