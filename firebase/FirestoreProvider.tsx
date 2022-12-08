import { ReactNode } from 'react'
import {useFirebaseFirestore, FirestoreContext} from './firestore'

/**
 * 
 * @param props The properties that will be passed down to the component
 * @param props.children The child components that will be rendered inside the component
 */
export default function FirestoreProvider(props: {children: ReactNode}) {
    const firestore = useFirebaseFirestore()

    return (
        <FirestoreContext.Provider value={firestore}>
            {props.children}
        </FirestoreContext.Provider>
    )
}
