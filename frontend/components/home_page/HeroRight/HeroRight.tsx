import Login from './Login/Login'
import Registration from './Registration/Registration'
import ForgotPassword from './ForgotPassword/ForgotPassword'
import { useHomeContext } from '../context'
import { indexDirectory } from '../constants'

import styles from './HeroRight.module.css'

/**
 * The right part of the landing page's hero section
 * where the login, registration, and forgot password
 * forms is located
 * 
 * @return
 */
export default function HeroRight() {
    const {state, dispatch} = useHomeContext()

    return (
        <div className={styles.heroRight}>
            {/* Login */}
            <Login />

            {/* Registration */}
            <Registration />
                
            {/* Forgot Password */}
            <ForgotPassword />

            {/* Shadow */}
            <div
                className={`
                    ${styles.shadow} 
                    ${styles.formDiv}
                    ${state.currentIndex == indexDirectory.REGISTRATION && styles.flipRight}
                    ${state.currentIndex == indexDirectory.FORGOT_PASSWORD && styles.flipLeft}
                `}
            />
        </div>
    )
}