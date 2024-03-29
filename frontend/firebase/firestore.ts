import { useState, createContext, useContext, useEffect } from "react";
import { 
    doc,
    setDoc,
    getDoc,
    onSnapshot,
    Timestamp,
    addDoc,
    query,
    collection,
    getDocs,
    deleteDoc,
    orderBy,
    limit,
    CollectionReference,
    DocumentData,
} from "firebase/firestore";

import { useAuth } from "./auth";
import { projectAuth, projectFirestore } from "./_firebaseClient";
import {
    Entry,
    entryConverter
} from './firestore_classes'
import { AuthContextObject, FirestoreContextObject } from "./types";

const FirestoreContext = createContext<FirestoreContextObject>(null)

/**
 * The hook that returns a context object used to access functions
 * to interact with Firestore
 * 
 * @return The context object that contains the variables and methods
 *      to handle interaction with Firestore
 */
function useFirestore() {
    return useContext<FirestoreContextObject>(FirestoreContext)
}

/**
 * Custom hook to deal with retrieving and
 * manipulating data in 
 * 
 * @return The object that contains the variables and methods
 *      to handle interaction with Firestore
 */
function useFirebaseFirestore() {
    const auth = useAuth()
    const [profileData, setProfileData] = useState<object>({})
    const [entryData, setEntryData] = useState<Entry[]>([])

    useEffect(() => {
        /**
         * Causes 2 firestore READS
         */
        const entryRef = query(
            collection(projectFirestore, 'userData', auth.user.uid, 'entries'), 
            orderBy('date', 'desc')
        ).withConverter(entryConverter)

        const docRef = doc(
            projectFirestore, 
            'userData', 
            auth.user.uid
        )
        
        getDoc(docRef)
            .then(result => {
                if (result.exists()) {
                    setProfileData(result.data())
                }
                else {
                    console.log(projectAuth.currentUser)

                    setDoc(docRef, {
                        email: auth.user.email,
                        displayName: auth.user.displayName,
                        isDisabled: false,
                        canSendReport: true,
                        createdAt: Timestamp.now(),
                    }).then(() => {
                        getDoc(docRef).then(result => setProfileData(result.data()))
                    })
                    .catch(error => {
                        console.log(error)
                    })
                }
            })

        const unsubscribeProfile = onSnapshot(docRef, (snapshot) => {
            setProfileData(snapshot.data())
        })

        const unsubscribeEntry = onSnapshot(entryRef, (querySnapshot) => {
            const payload = []

            for (let entry of querySnapshot.docs) {
                payload.push({...entry.data().getData(), id: entry.id})
            }

            setEntryData(payload)
        })

        return () => {
            unsubscribeProfile()
            unsubscribeEntry()
        }
    }, [auth.user])

    /**
     * Add a new entry for the current user
     * 
     * @param entry The Entry object containing data for the new entry
     * @return None
     */
    const addEntry = (entry: Entry, onSuccess = (success: object) => {}, onFailure = (error: object) => {}) : void => {
        const entriesCollection: CollectionReference<DocumentData> = collection(
            projectFirestore, 
            'userData', 
            auth.user.uid, 
            'entries'
        ).withConverter(entryConverter)
        
        addDoc(entriesCollection, entry)
            .then(payload => onSuccess(payload))
            .catch(error => onFailure(error))
    }

    /**
     * Get all of the transaction entries of the user
     * 
     * @param onSuccess  The callback function for when the function returns
     * @param onFailure  The callback function for when an error occured
     * @return None
     */
    const getAllEntries = (onSuccess = (success) => {}, onFailure = (error) => {}) : void => {
        const entriesCollection = collection(projectFirestore, 'userData', auth.user.uid, 'entries').withConverter(entryConverter)
        const q = query(entriesCollection)

        getDocs(q)
            .then(result => {
                const payload = []
                for (let doc of result.docs) {
                    payload.push({...doc.data().getData(), id: doc.id})
                }
                onSuccess(payload)
            })
            .catch(error => onFailure(error))
    }

    /**
     * Get a set of latest transaction entries of the user
     * 
     * @param lim The maximum number of entries to be retrieved
     * @param onSuccess  The callback function for when the function returns
     * @param onFailure  The callback function for when an error occured
     * @return None
     */
    const getRecentEntries = (lim: number, onSuccess = (result) => {}, onFailure = () => {}) : void => {
        const entriesCollection = collection(projectFirestore, 'userData', auth.user.uid, 'entries').withConverter(entryConverter)
        const q = query(entriesCollection, limit(lim), orderBy('date', 'desc'))

        console.log(entriesCollection.path)

        getDocs(q)
            .then(result => {
                const payload = []
                for (let i = 0; i < result.size; i++) {
                    payload.push({...result.docs[i].data().getData(), id: result.docs[i].id})
                }

                onSuccess(payload)
            })
        .catch(error => onFailure())
    }

    /**
     * Delete a entry by the entry's id
     * 
     * @param id The id of the entry on Firebase
     * @param onSuccess  The callback function for when the function returns
     * @param onFailure  The callback function for when an error occured
     * @return None
     */
    const deleteEntry = (id: string, onSuccess = () => {}, onFailure = (error) => {}) : void => {
        const targetDoc = doc(projectFirestore, 'userData', auth.user.uid, 'entries', id)

        deleteDoc(targetDoc)
            .then(() => {
                onSuccess()
            })
            .catch((error) => {
                onFailure(error)
            })
    }

    return {
        profileData,
        entryData,
        addEntry,
        getAllEntries,
        getRecentEntries,
        deleteEntry
    }
}

export { FirestoreContext, useFirestore, useFirebaseFirestore }