/**
 * components/home_page/HeroRight/HeroRight.js
 * 
 * The right part of the landing page's hero section
 * where the login, registration, and forgot password
 * forms is located
 */
import Login from './Login/Login'
import Registration from './Registration/Registration'
import ForgotPassword from './ForgotPassword/ForgotPassword'
import {
    indexDirectory
} from '../dispatcher'

import styles from './HeroRight.module.css'

export default function HeroRight(props) {
    /** The corresponding reducer state and dispatch function */
    const {state, dispatch} = props

    return (
        <div className={styles.heroRight}>
            {/* Login */}
            <Login state={state} dispatch={dispatch} />

            {/* Registration */}
            <Registration state={state} dispatch={dispatch} />
                
            {/* Forgot Password */}
            <ForgotPassword state={state} dispatch={dispatch} />

            {/* Shadow */}
            <div
                className={`
                    ${styles.shadow} 
                    ${styles.formDiv}
                    ${state.currentIndex == indexDirectory['REGISTRATION'] && styles.flipRight}
                    ${state.currentIndex == indexDirectory['FORGOT_PASSWORD'] && styles.flipLeft}
                `}
            />
        </div>
    )
}