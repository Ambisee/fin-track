/**
 * /components/home_page/HeroRight/Registration/Registration.js
 */
import { useState } from 'react'

import InputField from '../../InputField/InputField'
import { useAuth } from '../../../../firebase/auth'
import { GO_TO_LOGIN, indexDirectory } from '../../constants'
import { flashMessage } from '../../../common/helper'

import styles from '../HeroRight.module.css'
import { ERROR, INFO } from '../../../common/MessageIndicator/constants'
import { useHomeContext } from '../../context'

/**
 * The 'Sign up' form component used to
 * create new users by email and password
 * 
 * @param props Properties that will be passed down to the component
 * @param state Object that contains the forms' display state
 * @param dispatch `state`'s corresponding dispatch function 
 * @returns 
 */
export default function Registration(props) {
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const auth = useAuth()
    const {state, dispatch} = useHomeContext()

    return (
        <div 
            className={`
                ${styles.register} 
                ${styles.formDiv}
                ${state.currentIndex == indexDirectory.REGISTRATION ? styles.flipped : ""}
            `}
        >
            <h4>Create an Account</h4>
            <p>
                Sign up for an account with your email and a password. 
            </p>
            <form 
                className={styles.registrationForm}
                onSubmit={(e) => {
                    e.preventDefault()
                    flashMessage(dispatch, "Loading...", INFO)

                    auth.createNewUser(
                        newEmail,
                        newPassword,
                        confirmPassword,
                        (e) => flashMessage(dispatch, e.message, INFO, 3000),
                        (e) => flashMessage(dispatch, e.message, ERROR, 3000)
                    )
                    setNewEmail("")
                    setNewPassword("")
                    setConfirmPassword("")
                }}
            >
                <InputField 
                    id="registration-email"
                    name="email" 
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    // validate
                />
                <InputField 
                    id="registration-password"
                    name="password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} 
                    minLength={6}
                    required
                />
                <InputField 
                    id="registration-confirm-password"
                    name="confirm-password" 
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    minLength={6}
                    required
                />
                <button
                    className={styles.submitButton}
                    type="submit"
                >
                    Submit
                </button>
            </form>
            <span className={styles.goToLogin}>
                Have an account?
                <button
                    type="button"
                    className={styles.formLink}
                    onClick={() => dispatch({ type: GO_TO_LOGIN })}
                >
                    Sign in
                </button>
            </span>
        </div>
    )
}