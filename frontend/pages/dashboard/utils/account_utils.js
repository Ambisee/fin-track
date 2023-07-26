/**
 * Defines helper functions for the
 * dashboard's account page 
 */
import {
    User,
    UserCredential,
    GoogleAuthProvider,
    EmailAuthProvider,
    reauthenticateWithPopup,
    reauthenticateWithCredential
} from 'firebase/auth'

const dataReducerHandlers = {}
const reauthenticationHandlers = {}

const SET_EMAIL = 'SET_EMAIL'
const SET_DISPLAY_NAME = 'SET_DISPLAY_NAME'
const SET_ALLOW_EMAIL_REPORT = 'SET_ALLOW_EMAIL_REPORT'

dataReducerHandlers.SET_EMAIL = (state, action) => ({...state, email: action.value})
dataReducerHandlers.SET_DISPLAY_NAME = (state, action) => ({...state, displayName: action.value})
dataReducerHandlers.SET_ALLOW_EMAIL_REPORT = (state, action) => ({...state, canSendReport: action.value})

/**
 * Reauthenticate the user through Google
 * 
 * @param {User} user 
 *      The user object that contains the user data
 * @param {Function[UserCredential]} callback 
 *      Callback function for when the reauthentication is successful
 * @param {Function} onFailure 
 *      The error callback
 */
reauthenticationHandlers['google.com'] = (user, callback = (result) => {}, onFailure = (error) => {}) => {
    reauthenticateWithPopup(user, new GoogleAuthProvider())
        .then(
            value => {
                callback(value)
            }
        )
        .catch(error => {
            onFailure(error)
        })
}

/**
 * Reauthenticate the user through email and password
 * 
 * @param {User} user 
 *      The user object that contains the user data
 * @param {Function[UserCredential]} callback 
 *      Callback function for when the reauthentication is successful
 * @param {Function} onFailure 
 *      The error callback
 */
reauthenticationHandlers['password'] = (user, callback = () => {}, onFailure = () => {}) => {
    const pw = prompt("Please re-enter your password : ")
    reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, pw))
        .then(value => {
            callback(value)
        })
        .catch(error => {
            onFailure(error)
        })
}

function reducer(state, action) {
    const handler = dataReducerHandlers[action.type]
    if (handler == undefined) return state
    return handler(state, action)
}

export {
    SET_EMAIL,
    SET_DISPLAY_NAME,
    SET_ALLOW_EMAIL_REPORT,
    reauthenticationHandlers,
    reducer
}