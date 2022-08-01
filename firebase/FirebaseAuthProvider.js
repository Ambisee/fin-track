import React from "react";
import { FirebaseAuthContext, useFirebaseAuth } from "./auth";

/**
 * Authentication context provider component
 * 
 * @param {Object} props 
 *      Properties that will be passed down to the component
 * @param {React.Component} children
 *      Child element that will be rendered inside the component
 * @returns
 */
function FirebaseAuthProvider(props) {
    const auth = useFirebaseAuth()
    const {
        children
    } = props

    return (
        <FirebaseAuthContext.Provider value={auth}>
            {children}
        </FirebaseAuthContext.Provider>
    )
}

export default FirebaseAuthProvider
export { FirebaseAuthContext }