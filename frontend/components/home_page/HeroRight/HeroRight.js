import Login from './Login/Login'
import Registration from './Registration/Registration'
import ForgotPassword from './ForgotPassword/ForgotPassword'
import {
    indexDirectory
} from '../dispatcher'

import styles from './HeroRight.module.css'

/**
 * The right part of the landing page's hero section
 * where the login, registration, and forgot password
 * forms is located
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component
 * @param {Object} props.state
 *      The Object that stores the state values used by the component
 * @param {Function} props.dispatch
 *      The dispatch function used to manipulate the state values
 * @returns 
 */
export default function HeroRight(props) {
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