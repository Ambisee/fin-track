import { useState } from "react"
import {Auth} from 'firebase/auth'

import { errorToMessage, flashMessage } from '../../../common/utils'
import { useAuth } from '../../../../firebase/auth'
import InputField from "../../InputField/InputField"
import ProviderLoginButton from "../../ProviderLoginButton/ProviderLoginButton"
import { ERROR, INFO } from "../../../common/MessageIndicator/MessageIndicator"
import { GO_TO_FORGOT_PASSWORD, GO_TO_REGISTRATION, indexDirectory, TOGGLE_MESSAGE } from "../../dispatcher"

import styles from "../HeroRight.module.css"
import googleLogo from "../../../../public/google-logo.png"

/**
 * Wrapped email sign-in function for the 'login' process
 * 
 * @param {Auth} auth 
 *    The Auth instance of the current application
 * @param {String} email 
 *    The user's email address 
 * @param {String} password 
 *    The password the user entered
 * @param {Function} dispatch 
 *    The dispatch function for displaying status messages
 */
function wrappedEmailSignIn(auth, email, password, dispatch) {
  dispatch({type: TOGGLE_MESSAGE, payload: {showMessage: true, message: 'Signing in...', type: INFO}})
  flashMessage(dispatch, "Signing in...", INFO)

  auth.emailSignIn(
    email,
    password,
    (e) => flashMessage(dispatch, e.message, INFO, 3000),
    (e) => {flashMessage(dispatch, errorToMessage[e.code], ERROR, 3000); console.log(e)}
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
        className={styles.loginForm}
        onSubmit={(e) => {
          e.preventDefault()
          wrappedEmailSignIn(auth, email, password, dispatch)
        }}
      >
        <InputField
          id="login-email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => {setEmail(e.target.value)}}
          required
        ></InputField>
        <div style={{width: '100%'}}>
          <InputField
            id="login-password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => {setPassword(e.target.value)}}
            required
          ></InputField>
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
        </div>
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
              (e) => flashMessage(dispatch, e.message, INFO, 3000),
              (e) => flashMessage(dispatch, errorToMessage[e.code], ERROR, 3000)
            )
          }}
        ></ProviderLoginButton>
      </div>
    </div>
  )
}
