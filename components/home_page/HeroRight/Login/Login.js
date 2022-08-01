import { useState } from "react"

import { flashMessage } from '../../utils'
import { useAuth } from '../../../../firebase/auth'
import { GO_TO_FORGOT_PASSWORD, GO_TO_REGISTRATION, indexDirectory, SHOW_MESSAGE } from "../../dispatcher"
import InputField from "../../InputField/InputField"
import ProviderLoginButton from "../../ProviderLoginButton/ProviderLoginButton"

import googleLogo from "../../../../public/google-logo.png"
import facebookLogo from "../../../../public/facebook-logo.png"
import styles from "../HeroRight.module.css"

/**
 * Wrapped email sign-in function for the 'login' process
 * 
 * @param {import("firebase/auth").Auth} auth 
 *    The Auth instance of the current application
 * @param {String} email 
 *    The user's email address 
 * @param {String} password 
 *    The password the user entered
 * @param {Function} dispatch 
 *    The dispatch function for displaying status messages
 */
function wrappedEmailSignIn(auth, email, password, dispatch) {
  dispatch({type: SHOW_MESSAGE, payload: {message: 'Signing in...', type: 'info'}})
  
  auth.emailSignIn(
    email,
    password,
    (e) => flashMessage(dispatch, e.message, 'info', 3000),
    (e) => flashMessage(dispatch, e.message, 'error', 3000)
  )
}

/**
 * The 'Forgot password' form component used to log
 * the user in through email and password, or through
 * one of the login providers
 * 
 * @param {Object} props 
 *    The properties that will be passed down to the component
 * @param {Object} props.state
 *      Object that contains the forms' display state
 * @param {Function} props.dispatch
 *      the `state`'s corresponding dispatch function 
 * @returns 
 */
export default function Login(props) {
  const {
    state,
    dispatch
  } = props

  /**
   * email: String = 
   *    store value of email corresponding to an account
   * password: String = 
   *    store value of the user-entered password
   * auth: Object =
   *    Authentication context used to retrieve the necessary functions
   */
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const auth = useAuth()

  return (
    <div
      className={`
            ${styles.login} 
            ${styles.formDiv}
            ${state.currentIndex == indexDirectory['REGISTRATION'] ? styles.flipRight : ""}
            ${state.currentIndex == indexDirectory['FORGOT_PASSWORD'] ? styles.flipLeft : ""}
        `}
    >
      <h4>Login to your account</h4>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          wrappedEmailSignIn(auth, email, password, dispatch)
        }}
      >
        <InputField
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <InputField
          name="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="button"
          className={`
                ${styles.formLink}
                ${styles.forgotPasswordButton}
            `}
          onClick={() => dispatch({ type: GO_TO_FORGOT_PASSWORD })}
        >
          Forgot password?
        </button>
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
        <span>
          Don&apos;t have an account?
          <button
            type="button"
            className={styles.formLink}
            onClick={() => dispatch({ type: GO_TO_REGISTRATION })}
          >
            Create an account
          </button>
        </span>
      </form>
      <div className={styles.divider}>
        <hr />
        <p>OR</p>
        <hr />
      </div>
      <div className={styles.providerLogin}>
        <ProviderLoginButton
          providerName="Google"
          imgSrc={googleLogo}
          logoBgColor="white"
          onClick={() => {
            auth.googleSignIn(
              (success) => { },
              (error) => alert(error)
            )
          }}
        />
        <ProviderLoginButton
          providerName="Facebook"
          imgSrc={facebookLogo}
          logoBgColor="#4664a5"
        />
      </div>
    </div>
  )
}
