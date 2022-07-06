import { useState } from 'react'

import InputField from '../../InputField/InputField'
import { useAuth } from '../../../../firebase/auth'
import { GO_TO_LOGIN, indexDirectory, SHOW_MESSAGE} from '../../dispatcher'
import { flashMessage } from '../../utils'

import styles from '../HeroRight.module.css'

export default function Registration({state, dispatch}) {
    const auth = useAuth()

    const [newEmail, setNewEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

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