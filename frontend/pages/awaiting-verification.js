import { useReducer } from "react"
import { useRouter } from "next/router"
import { useAuth } from "../firebase/auth"
import { AnimatePresence } from 'framer-motion'

import Loading from "../components/common/Loading/Loading"
import MessageIndicator from '../components/common/MessageIndicator/MessageIndicator'
import { reducer, defaultValues, SHOW_MESSAGE } from '../components/home_page/dispatcher'
import { flashMessage } from '../components/common/utils'

import styles from './styles/awaiting-verification.module.css'
import Head from "next/head"

/**
 * The landing page for users who registered with 
 * an email and password who logged in without verifying
 * their account yet.
 * 
 * @returns 
 */
export default function AwaitingVerificationPage() {
    const [state, dispatch] = useReducer(reducer, defaultValues)
    const auth = useAuth()
    const router = useRouter()

    if (auth?.user === undefined) {
        return <Loading />
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
                            dispatch({type: SHOW_MESSAGE, payload: {message: "Sending request...", type: "info"}})
                            auth.verifyNewUser(
                                auth.user,
                                (e) => flashMessage(dispatch, e.message, "info", 3000),
                                (e) => flashMessage(dispatch, e.message, "error", 3000)
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
            <AnimatePresence>
                {state.showMessage &&
                    <MessageIndicator state={state} className={styles.indicatorPos} />
                }
            </AnimatePresence>
        </div>
    )
}
