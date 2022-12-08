import { ReactNode } from "react";

import { FirebaseAuthContext, useFirebaseAuth } from "./auth";

/**
 * Authentication context provider component
 * 
 * @param props Props for the component
 * @param props.children The element that will be rendered inside the context
 * @return
 */
export default function FirebaseAuthProvider(props: {children: ReactNode}) {
    const auth = useFirebaseAuth()

    return (
        <FirebaseAuthContext.Provider value={auth}>
            {props.children}
        </FirebaseAuthContext.Provider>
    )
}
