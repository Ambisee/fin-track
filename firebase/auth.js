/**
 * /firebase/auth.js
 * 
 * Defines authentication-related
 * hooks and context
 */

import nookies from 'nookies'
import {
    useState,
    useEffect,
    useContext,
    createContext
} from "react";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut,
    onIdTokenChanged,
} from "firebase/auth";

import { projectAuth } from "./firebaseClient";

/** The context used to store the authentication state */
const FirebaseAuthContext = createContext()

function useAuth() {
    /**
     * Custom hook to access the authentication context
     */
    return useContext(FirebaseAuthContext)
}

function useFirebaseAuth() {
    /** user: UserCredential = 
     *      Stores the user's credential in the global scope 
     */
    const [user, setUser] = useState(undefined)

    const emailSignIn = (email, password, onSuccess = (success) => { }, onFailure = (error) => { }) => {
        /** 
         * Wrapper function for signing users in through email 
         * 
         * email: String =
         *      user's email address
         * password: String = 
         *      password corresponding to the user's email
         * onSuccess: Function = 
         *      callback function when the sign-in process succeeded
         * onFailure: Function = 
         *      callback function when the sign-in process failed
         */
        signInWithEmailAndPassword(projectAuth, email, password)
            .then(response => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                setUser(null)
                onFailure({ ...error, message: `Invalid email or password` })
            })
    }

    const googleSignIn = (onSuccess = (success) => { }, onFailure = (error) => { }) => {
        /** 
         * Wrapper function for signing users in through the Google provider.
         * Calling this function will create a Google sign-in popup.
         * 
         * onSuccess: Function = 
         *      callback function when the sign-in process succeeded
         * onFailure: Function = 
         *      callback function when the sign-in process failed
         */
        const provider = new GoogleAuthProvider()
        signInWithPopup(projectAuth, provider)
            .then(response => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                setUser(null)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const facebookSignIn = (onSuccess = (success) => { }, onFailure = (error) => { }) => {
        /** 
         * Wrapper function for signing users in through the Facebook popup.
         * 
         * onSuccess: Function = 
         *      callback function when the sign-in process succeeded
         * onFailure: Function = 
         *      callback function when the sign-in process failed
         */
        const provider = new FacebookAuthProvider()
        signInWithPopup(projectAuth, provider)
            .then(response => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                setUser(null)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const createNewUser = (email, password, confirmPassword, onSuccess = (success) => { }, onFailure = (error) => { }) => {
        /** 
         * Wrapper function for creating a new user with an email and password
         * 
         * email: String = 
         *      An email address to create the account with
         * password: String = 
         *      A password that will be used to log in into the account
         * confirmPassword: String =
         *      An instance to which `password` will be compared against
         * onSuccess: Function = 
         *      callback function when the sign-up process succeeded
         * onFailure: Function = 
         *      callback function when the sign-up process failed
         */
        if (password !== confirmPassword) {
            /** Raise an error if `password` and `confirmPassword` */
            onFailure({ message: `The password doesn't match!` })
            return
        }

        createUserWithEmailAndPassword(projectAuth, email, password)
            .then(response => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ message: 'Created a new user, verify the new account now' })
                sendEmailVerification(response.user)
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                console.log(error)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const verifyNewUser = (user, onSuccess = () => { }, onFailure = () => { }) => {
        /** 
         * Wrapper function for sending a verification email to a new user
         * created through email and password
         * 
         * user: UserCredential =
         *      the UserCredential object that corresponds to the user to send
         *      a verification email to
         * onSuccess: Function = 
         *      callback function when the verification process succeeded
         * onFailure: Function = 
         *      callback function when the verification process failed
         */
        sendEmailVerification(user)
            .then(response => {
                /** 
                 * response: undefined =
                 *      UNDEFINED
                 */
                console.log(response)
                onSuccess({ ...response, message: 'Verification email sent' })
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                onFailure({ ...error, message: 'Failed to send a verification email' })
            })
    }

    const resetPassword = (email, onSuccess = () => { }, onFailure = () => { }) => {
        /** 
         * Wrapper function for sending a verification email to a new user
         * created through email and password
         * 
         * email: String =
         *      the email whose password is to be reset
         * onSuccess: Function = 
         *      callback function when the password reset process succeeded
         * onFailure: Function = 
         *      callback function when the password reset process failed
         */
        sendPasswordResetEmail(projectAuth, email)
            .then(response => {
                /** 
                 * response: undefined =
                 *      UNDEFINED
                 */
                onSuccess({ message: `Check your email at ${email}` })
            })
            .catch(error => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                onFailure({ ...error, message: "Invalid email or user doesn't exist" })
            })
    }

    const userSignOut = () => {
        /**
         * Wrapper function for signing the user out
         */
        signOut(projectAuth)
        setUser(null)
    }

    useEffect(() => {
        const unsubscribeAuthListener = onIdTokenChanged(projectAuth, async (user) => {
            /**
             * Initializing an event listener that listens to changes
             * in the user's authentication state
             */
            if (user) {
                /** Save the user credential to a React state and in cookies */
                const token = await user.getIdToken()
                setUser(user)
                nookies.set(undefined, 'token', token, { path: '/' })
            } else {
                /** Clear the saved user credential */
                setUser(null)
                nookies.set(undefined, 'token', '', { path: '/' })
            }
        })

        return () => {
            unsubscribeAuthListener()
        }
    }, [])

    return {
        user,
        emailSignIn,
        googleSignIn,
        facebookSignIn,
        createNewUser,
        verifyNewUser,
        resetPassword,
        userSignOut
    }
}

export { useFirebaseAuth, useAuth, FirebaseAuthContext }