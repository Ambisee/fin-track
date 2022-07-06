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

const FirebaseAuthContext = createContext()

function useAuth() {
    return useContext(FirebaseAuthContext)
}

function useFirebaseAuth() {
    const [user, setUser] = useState(undefined)

    const emailSignIn = (email, password, onSuccess = (success) => { }, onFailure = (error) => { }) => {
        signInWithEmailAndPassword(projectAuth, email, password)
            .then(response => {
                // response: Object(UserCredential)
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                setUser(null)
                onFailure({ ...error, message: `Invalid email or password` })
            })
    }

    const googleSignIn = (onSuccess = (success) => { }, onFailure = (error) => { }) => {
        const provider = new GoogleAuthProvider()
        signInWithPopup(projectAuth, provider)
            .then(response => {
                // response: Object(UserCredential)
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                setUser(null)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const facebookSignIn = (onSuccess = (success) => { }, onFailure = (error) => { }) => {
        const provider = new FacebookAuthProvider()
        signInWithPopup(projectAuth, provider)
            .then(response => {
                // response: Object(UserCredential)
                setUser(response.user)
                onSuccess({ ...response, message: `Signed in as ${response.user.email}` })
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                setUser(null)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const createNewUser = (email, password, confirmPassword, onSuccess = (success) => { }, onFailure = (error) => { }) => {
        if (password !== confirmPassword) {
            onFailure({ message: `The password doesn't match!` })
            return
        }

        createUserWithEmailAndPassword(projectAuth, email, password)
            .then(response => {
                // response: Object(UserCredetial)
                setUser(response.user)
                onSuccess({ message: 'Created a new user, verify the new account now' })
                sendEmailVerification(response.user)
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                console.log(error)
                onFailure({ ...error, message: `An error occured: ${error.code}` })
            })
    }

    const verifyNewUser = (user, onSuccess = () => { }, onFailure = () => { }) => {
        sendEmailVerification(user)
            .then(response => {
                // response: undefined
                console.log(response)
                onSuccess({ ...response, message: 'Verification email sent' })
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                onFailure({ ...error, message: 'Failed to send a verification email' })
            })
    }

    const resetPassword = (email, onSuccess = () => { }, onFailure = () => { }) => {
        sendPasswordResetEmail(projectAuth, email)
            .then(response => {
                // response: undefined
                onSuccess({ message: `Check your email at ${email}` })
            })
            .catch(error => {
                // error: {code: String, customData: Object, name: String}
                onFailure({ ...error, message: "Invalid email or user doesn't exist" })
            })
    }

    const userSignOut = () => {
        signOut(projectAuth)
        setUser(null)
    }

    useEffect(() => {
        const unsubscribeAuthListener = onIdTokenChanged(projectAuth, async (user) => {
            if (user) {
                const token = await user.getIdToken()
                setUser(user)
                nookies.set(undefined, 'token', token, { path: '/' })
            } else {
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