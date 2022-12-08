import nookies from 'nookies'
import {
    useState,
    useEffect,
    useContext,
    createContext,
} from "react";
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    GoogleAuthProvider,
    onIdTokenChanged,
    signOut,
    User,
    UserCredential,
    updateProfile,
    AuthError,
    Unsubscribe
} from "firebase/auth";

import { projectAuth } from "./_firebaseClient";
import { AuthContextObject, SuccessCallback, FailureCallback } from './types'

/** The context used to store the authentication state */
const FirebaseAuthContext = createContext<AuthContextObject>(null)
 
/**
 * Custom hook to access the authentication context
 * from the frontend components
 *    
 * @return An object containing data stored in the FirebaseAuthContext component
 */
function useAuth() {
    return useContext<AuthContextObject>(FirebaseAuthContext)
}

/**
 * Custom hook that defines the authentication
 * methods and stores the User object
 * 
 * @return The object that stores the methods and variables
 *      that handles authentication
 */
function useFirebaseAuth(): AuthContextObject {
    const [user, setUser] = useState<User>(undefined)
    
    /**
     * Wrapper function for signing users in through email and password.
     * 
     * @param email The user's email address
     * @param password The password corresponding to the user's email
     * @param onSuccess Callback function when the sign-in process succeeded
     * @param onFailure Callback function when the sign-in process failed
     * @return None
     */
    const emailSignIn = (
        email: string, 
        password: string, 
        onSuccess: SuccessCallback = (success: object) => { },
        onFailure: FailureCallback = (error: object) => { }
    ): void => {
        signInWithEmailAndPassword(projectAuth, email, password)
            .then((response: UserCredential) => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch((error: AuthError) => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                setUser(null)
                onFailure({ ...error, message: `Invalid email or password` })
            })
    }
    
    /**
     * Wrapper function for signing users in through the Google provider.
     * Calling this function will create a Google sign-in popup.
     * 
     * @param onSuccess Callback function when the sign-in process succeeded
     * @param onFailure Callback function when the sign-in process failed
     * @return None
     */
    const googleSignIn = (
        onSuccess: SuccessCallback = (success: object) => { }, 
        onFailure: FailureCallback = (error: object) => { }
    ): void => {
        const provider: GoogleAuthProvider = new GoogleAuthProvider()
        signInWithPopup(projectAuth, provider)
            .then((response: UserCredential) => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch((error: AuthError) => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                setUser(null)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    /** 
     * Wrapper function for creating a new user with an email and password
     * 
     * @param email An email address to create the account with
     * @param password A password that will be used to log in into the account
     * @param confirmPasswordAn instance to which `password` will be compared against
     * @param onSuccess Callback function when the sign-up process succeeded
     * @param onFailure Callback function when the sign-up process failed
     * @return None
     */
    const createNewUser = (
        email: string,
        password: string,
        confirmPassword: string,
        onSuccess: SuccessCallback = (success) => { },
        onFailure: FailureCallback = (error) => { }
    ): void => {
        if (password !== confirmPassword) {
            /** Raise an error if `password` and `confirmPassword` */
            onFailure({ message: `The password doesn't match!` })
            return
        }
        
        createUserWithEmailAndPassword(projectAuth, email, password)
            .then((response: UserCredential) => {
                /** 
                 * response: UserCredential =
                 *      a UserCredential object containing the credentials of the signed in user
                 */
                setUser(response.user)

                onSuccess({ message: 'Created a new user, verify the new account now' })
                sendEmailVerification(response.user)
            })
            .catch((error: AuthError) => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    /**
     * Update the user's profile information such as
     * username and profile picture URL
     * 
     * @param displayName The new display name to be changed into
     * @param photoURL The new URL path to the user's profile picture
     * @param onSuccess Callback for when the process finsihes properly
     * @param onFailure Callback for when the process doesn'f finish properly
     * @return None
     */
    const setUserProfile = (
        displayName: string | undefined = user?.displayName, 
        photoURL: string | undefined = user?.photoURL, 
        onSuccess: SuccessCallback = (resp: object) => {}, 
        onFailure: FailureCallback = (error: object) => {}
    ): void => {
        updateProfile(user, {
            displayName: displayName || user.displayName,
            photoURL: photoURL || user.photoURL
        })
        .then(() => {
            onSuccess({ message: "Successfully changed the profile data" })
        })
        .catch((error: AuthError) => {
            onFailure({...error, message: `An error occured: ${error.code}`})
        })
    }

    /** 
     * Wrapper function for sending a verification email to a new user
     * created through email and password
     * 
     * @param user The UserCredential object that corresponds to the
     *      user to send a verification email to
     * @param onSuccess callback function when the verification process succeeded
     * @param onFailure callback function when the verification process failed
     */
    const verifyNewUser = (user, onSuccess = (responseObj) => { }, onFailure = (error) => { }) => {
        sendEmailVerification(user)
            .then(() => {
                /** 
                 * response: undefined =
                 *      UNDEFINED
                 */
                onSuccess({ message: 'Verification email sent' })
            })
            .catch((error: object) => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                onFailure({ ...error, message: 'Failed to send a verification email' })
            })
    }

    /** 
     * Wrapper function for sending a verification email to a new user
     * created through email and password
     * 
     * @param  email The email whose password is to be reset
     * @param  onSuccess Callback function when the password reset process succeeded
     * @param  onFailure Callback function when the password reset process failed
     * @return None
     */
    const resetPassword = (
        email: string,
        onSuccess = (msgObj: object) => { },
        onFailure: FailureCallback = (error: object) => { }
    ) => {
        sendPasswordResetEmail(projectAuth, email)
            .then(() => {
                onSuccess({ message: `Check your email at ${email}` })
            })
            .catch((error: AuthError) => {
                /** 
                 * error: Object({code: String, customData: AuthError, name: String}) =
                 *      an object containing an AuthError object detailing the error encountered
                 */
                onFailure({ ...error, message: "Invalid email or user doesn't exist" })
            })
    }

    /**
     * Wrapper function for signing the user out
     */
    const userSignOut = () => {
        signOut(projectAuth)
        setUser(null)
    }

    useEffect(() => {
        const unsubscribeAuthListener: Unsubscribe = onIdTokenChanged(projectAuth, async (user) => {
            /**
             * Initializing an event listener that listens to changes
             * in the user's authentication state
             */
            if (user) {
                /** Save the user credential to a React state and in cookies */
                const token: string = await user.getIdToken(true)
                
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
        setUserProfile,
        createNewUser,
        verifyNewUser,
        resetPassword,
        userSignOut
    }
}

export { useFirebaseAuth, useAuth, FirebaseAuthContext }
