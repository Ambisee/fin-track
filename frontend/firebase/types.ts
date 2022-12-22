import { User } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

import { Entry } from "./firestoreClasses";

export interface AuthContextObject {
    user: User,
    emailSignIn: (
        email: string,
        password: string,
        onSuccess: Callback<any>,
        onFailure: Callback<any>
    ) => void,
    googleSignIn: (
        onSuccess: Callback<any>, 
        onFailure: Callback<any>
    ) => void,
    createNewUser: (
        email: string, 
        password: string, 
        confirmPassword: string, 
        onSuccess: Callback<any>, 
        onFailure: Callback<any>
    ) => void,
    setUserProfile: (
        displayName: string,
        photoURL: string,
        onSuccess: Callback<any>,
        onFailure: Callback<any>
    ) => void,
    verifyNewUser: (
        user: User,
        onSuccess: Callback<any>,
        onFailure: Callback<any>
    ) => void,
    resetPassword: (
        email: string,
        onSuccess: Callback<any>,
        onFailure: Callback<any>
    ) => void,
    userSignOut: () => void
}

export interface FirestoreContextObject {
    profileData: object,
    entryData: object,
    addEntry: (
        entry: Entry, 
        onSuccess: Callback<any>, 
        onFailure:Callback<any>
    ) => any,
    getAllEntries: (
        onSuccess: Callback<any>, 
        onFailure:Callback<any>
    ) => any,
    getRecentEntries: (
        lim: number, 
        onSuccess: Callback<any>, 
        onFailure:Callback<any>
    ) => any,
    deleteEntry: (
        id: string, 
        onSuccess: Callback<any>, 
        onFailure: Callback<any>
    ) => any
}

export interface ServiceAccountObject {
    private_key?: string,
    client_email?: string,
    project_id?: string
}

export interface EntryData {
    date: Date,
    detail: string,
    amount: string
}

export interface ProfileData {
    email: string,
    displayName: string,
    isDisabled: boolean,
    canSendReport: boolean,
    createdAt: Timestamp | Date,
}

export type Callback<T> = (data?: void | T) => void
