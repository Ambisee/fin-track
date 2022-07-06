import * as firebaseAdmin from 'firebase-admin'

if (!firebaseAdmin.apps.length) {
    const serviceAccount = JSON.parse(process.env.NEXT_PUBLIC_SERVICE_ACCOUNT)

    firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert({
            privateKey: serviceAccount.private_key,
            clientEmail: serviceAccount.client_email,
            projectId: serviceAccount.project_id,
        }),
        databaseURL: ""
    })
}

export { firebaseAdmin }