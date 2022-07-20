/**
 * /components/home_page/HeroRight/Registration/Registration.js
 * 
 * The 'Sign up' form component used to
 * create new users by email and password
 */
import { useState } from 'react'

import InputField from '../../InputField/InputField'
import { useAuth } from '../../../../firebase/auth'
import { GO_TO_LOGIN, indexDirectory, SHOW_MESSAGE} from '../../dispatcher'
import { flashMessage } from '../../utils'

import styles from '../HeroRight.module.css'

export default function Registration(propsw) {
    /**
     * state: Object =
     *      Object that contains the forms' display state
     * dispatch: Function =
     *      the `state`'s corresponding dispatch function 
     */
    const {
        state,
        dispatch
    } = props

    /**
     * newEmail: String = 
     *      store value of the new email
     * newPassword: String = 
     *      store value of the new password
     * confirmPassword: String = 
     *      store value of the confirmation password
     * auth: Object =
     *      Authentication context used to retrieve the necessary authentication functions
     */
    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const auth = useAuth()


    return (
        <div 
            className={`
                ${styles.register} 
                ${styles.formDiv}
                ${state.currentIndex == indexDirectory['REGISTRATION'] ? styles.flipped : ""}
            `}
        >
            <h4>Create an Account</h4>
            <form 
                className={styles.registrationForm}
                onSubmit={(e) => {
                    e.preventDefault()
                    dispatch({type: SHOW_MESSAGE, payload: {message: "Loading...", type: 'info'}})

                    auth.createNewUser(
                        newEmail,
                        newPassword,
                        confirmPassword,
                        (e) => flashMessage(dispatch, e.message, 'info', 3000),
                        (e) => flashMessage(dispatch, e.message, 'error', 3000)
                    )
                    setNewEmail("")
                    setNewPassword("")
                    setConfirmPassword("")
                }}
            >
                <InputField 
                    name="email" 
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    required
                    validate
                />
                <InputField 
                    name="password"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)} 
                    minLength={6}
                    required
                />
                <InputField 
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
                    onClick={() => dispatch({type: GO_TO_LOGIN})}
                >
                    Sign in
                </button>
            </span>
        </div>
    )
}