import Head from "next/head"
import { useReducer } from "react"
import { useRouter } from "next/router"

import PageLoading from "../components/common/PageLoading/PageLoading"
import MessageIndicator from '../components/common/MessageIndicator/MessageIndicator'
import { useAuth } from "../firebase/auth"
import { flashMessage } from '../components/common/helper'
import { ERROR, INFO } from '../components/common/MessageIndicator/constants'
import { defaultValues, reducer } from "../components/awaiting_verification_page/dispatcher"
import { errorToMessage } from "../components/common/constants"
import { AuthError } from "firebase/auth"

import styles from '../public/css/awaiting-verification.module.css'


/**
 * The landing page for users who registered with 
 * an email and password who logged in without verifying
 * their account yet.
 * 
 * @returns 
 */
export default function AwaitingVerificationPage() {
    /**
     * Notes :
     * 
     * This page should only use state.indicatorState for the <MessageIndicator /> component
     * and dispatch as an argument for `flashMessage`
     */
    const auth = useAuth()
    const router = useRouter()
    const [state, dispatch] = useReducer(reducer, defaultValues)

    if (auth?.user === undefined) {
        return <PageLoading />
    }

    if (auth?.user === null) {
        router.push('/')
        return <></>
    }

    if (auth?.user.emailVerified) {
        router.push('/dashboard')
        return <></>
    }

    return (
        <div className={styles.container}>
            <Head>
                <title>{process.env.NEXT_PUBLIC_TITLE} | Awaiting Verification</title>
            </Head>
            <div className={styles.wrapper}>
                <h3>Verify your<br />email address</h3>
                <p>
                    A verification email is sent to your inbox.
                    Follow the steps and complete the verification process
                </p>
                <div className={styles.buttonDiv}>
                    <button
                        className={styles.lightTheme}
                        onClick={() => {
                            flashMessage(dispatch, "Sending request...", INFO)
                            auth.verifyNewUser(
                                auth.user,
                                (e: {message: string}) => flashMessage(dispatch, e.message, INFO, 3000),
                                (e: AuthError & {message: string}) => flashMessage(dispatch, errorToMessage[e.code] , ERROR, 3000)
                            )
                        }}
                    >
                        Resend verification link
                    </button>
                    <button
                        className={styles.darkTheme}
                        onClick={auth.userSignOut}
                    >
                        Sign out
                    </button>
                </div>
            </div>
            <MessageIndicator state={state.indicatorState} className={styles.indicatorPos} />
        </div>
    )
}
