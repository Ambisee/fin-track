import { User } from "firebase/auth";
import { Entry } from "./firestore_classes";

export interface AuthContextObject {
    user: User,
    emailSignIn: (
        email: string,
        password: string,
        onSuccess: SuccessCallback,
        onFailure: FailureCallback
    ) => void,
    googleSignIn: (
        onSuccess: SuccessCallback, 
        onFailure: FailureCallback
    ) => void,
    createNewUser: (
        email: string, 
        password: string, 
        confirmPassword: string, 
        onSuccess: SuccessCallback, 
        onFailure: FailureCallback
    ) => void,
    setUserProfile: (
        displayName: string,
        photoURL: string,
        onSuccess: SuccessCallback,
        onFailure: FailureCallback
    ) => void,
    verifyNewUser: (
        user: User,
        onSuccess: SuccessCallback,
        onFailure: FailureCallback
    ) => void,
    resetPassword: (
        email: string,
        onSuccess: SuccessCallback,
        onFailure: FailureCallback
    ) => void,
    userSignOut: () => void
}

export interface FirestoreContextObject {
    profileData: object,
    entryData: object,
    addEntry: (
        entry: Entry, 
        onSuccess: SuccessCallback, 
        onFailure:FailureCallback
    ) => any,
    getAllEntries: (
        onSuccess: SuccessCallback, 
        onFailure:FailureCallback
    ) => any,
    getRecentEntries: (
        lim: number, 
        onSuccess: SuccessCallback, 
        onFailure:FailureCallback
    ) => any,
    deleteEntry: (
        id: string, 
        onSuccess: SuccessCallback, 
        onFailure: FailureCallback
    ) => any
}

export interface ServiceAccountObject {
    private_key?: string,
    client_email?: string,
    project_id?: string
}

export type SuccessCallback = (success?: {message: string}) => any
export type FailureCallback = (error?: {message: string, code?: string}) => any
