import { useState } from 'react'

import InputField from '../../InputField/InputField'
import { useAuth } from '../../../../firebase/auth'
import { indexDirectory, GO_TO_LOGIN, SHOW_MESSAGE } from '../../dispatcher'
import { flashMessage } from '../../utils'

import styles from '../HeroRight.module.css'

export default function ForgotPassword({state, dispatch}) {
    const auth = useAuth()
    const [email, setEmail] = useState("")
    
    return (
        <div
            className={`
            ${styles.formDiv}
                ${styles.forgotPassword}
                ${state.currentIndex == indexDirectory['FORGOT_PASSWORD'] ? styles.flipped : ""}
            `}
        >
            <h4>Forgot your password?</h4>
            <p>
                Enter your recovery email address. You will receive an
                email detailing how to reset your password.
            </p>
            <form 
                onSubmit={(e) => {
                    e.preventDefault()
                    dispatch({
                        type: SHOW_MESSAGE, 
                        payload: {
                            type: 'info',
                            message: "Loading..."
                        }
                    })
                    
                    auth.resetPassword(
                        email,
                        (e) => {
                            setEmail("")
                            flashMessage(dispatch, e.message, 'info', 3000)

                        },
                        (e) => {
                            setEmail("")
                            flashMessage(dispatch, e.message, 'error', 3000)
                        }
                    )
                }}
            >
                <InputField 
                    name="email"
                    type="email"
                    onChange={e => setEmail(e.target.value)}
                    value={email}
                    required
                />
                <button className={styles.submitButton} type="submit">
                    Submit
                </button>
            </form>
            <button 
                className={styles.formLink}
                onClick={() => dispatch({type: GO_TO_LOGIN})}
            >
                Back to login
            </button>
        </div>
    )
}