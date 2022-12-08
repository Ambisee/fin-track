/**
 * Initializes the Firebase Javascript Client SDK
 */
import { FirebaseApp, initializeApp } from 'firebase/app'
import {
    Auth,
    getAuth, 
} from 'firebase/auth'
import { 
    Firestore, 
    getFirestore 
} from 'firebase/firestore'

const config = {
    apiKey: process.env.NEXT_PUBLIC_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN,
    databaseURL: process.env.NEXT_PUBLIC_DATABASE_URL,
    projectId: process.env.NEXT_PUBLIC_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_APP_ID
}

const firebaseApp: FirebaseApp = initializeApp(config)
const projectAuth: Auth = getAuth(firebaseApp)
const projectFirestore: Firestore = getFirestore(firebaseApp)

export { firebaseApp, projectAuth, projectFirestore }
