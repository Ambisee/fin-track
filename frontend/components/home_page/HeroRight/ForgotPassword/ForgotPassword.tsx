import { useState } from 'react'

import InputField from '../../InputField/InputField'
import { useAuth } from '../../../../firebase/auth'
import { indexDirectory, GO_TO_LOGIN } from '../../constants'
import { INFO, ERROR } from '../../../common/MessageIndicator/constants'
import { flashMessage } from '../../../common/helper'

import styles from '../HeroRight.module.css'
import { useHomeContext } from '../../context'

/**
 * The 'Forgot password' form component used to
 * reset the password of a user that signed up with an
 * email and password 
 * 
 * @param props The properties that will be passed down to the component
 * @param props.state Object that contains the forms' display state
 * @param props.dispatch The `state`'s corresponding dispatch function 
 * @return
 */
export default function ForgotPassword() {
    const {state, dispatch} = useHomeContext()
    const [email, setEmail] = useState("")
    const auth = useAuth()
    
    return (
        <div
            className={`
            ${styles.formDiv}
                ${styles.forgotPassword}
                ${state.currentIndex == indexDirectory.FORGOT_PASSWORD ? styles.flipped : ""}
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
                    flashMessage(dispatch, "Loading...", INFO, 3000)

                    auth.resetPassword(
                        email,
                        (e) => {
                            setEmail("")
                            flashMessage(dispatch, e.message, INFO, 3000)

                        },
                        (e) => {
                            setEmail("")
                            flashMessage(dispatch, e.message, ERROR, 3000)
                        }
                    )
                }}
            >
                <InputField
                    id="forgot-email" 
                    name="email"
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
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