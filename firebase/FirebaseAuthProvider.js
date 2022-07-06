import { FirebaseAuthContext, useFirebaseAuth } from "./auth";

function FirebaseAuthProvider({ children }) {
    const auth = useFirebaseAuth()

    return (
        <FirebaseAuthContext.Provider value={auth}>
            {children}
        </FirebaseAuthContext.Provider>
    )
}

export default FirebaseAuthProvider
export { FirebaseAuthContext }