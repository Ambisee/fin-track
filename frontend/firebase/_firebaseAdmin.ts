/**
 * Initializes the Firebase NodeJS Admin SDK
 */
import * as firebaseAdmin from 'firebase-admin'

import { ServiceAccountObject } from './types'


if (!firebaseAdmin.apps.length) {
    // Initialize the Admin SDK if it's not initialized already
    const serviceAccount: ServiceAccountObject = JSON.parse(process.env.NEXT_PUBLIC_SERVICE_ACCOUNT || "")

    if (serviceAccount) {
        firebaseAdmin.initializeApp({
            credential: firebaseAdmin.credential.cert({
                privateKey: serviceAccount.private_key,
                clientEmail: serviceAccount.client_email,
                projectId: serviceAccount.project_id,
            }),
            databaseURL: ""
        })    
    }
}

export { firebaseAdmin }