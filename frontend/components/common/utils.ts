import { TOGGLE_MESSAGE } from "../home_page/dispatcher";

/**
 * Utility function to display a message for a period of time
 * on the home page
 * 
 * @param dispatch the dispatch function that manipulates the state of the
 *      message indicator
 * @param message the message to be displayed
 * @param type the severity type of the message to be displayed
 * @param time the amount of time the image will be displayed for in milliseconds 
 */
function flashMessage(dispatch, message: string, type, time: number = 0) {
    dispatch({ type: TOGGLE_MESSAGE, payload: { message: message, showMessage: true, type: type } })
    
    if (time != 0) {
        setTimeout(() => dispatch({ type: TOGGLE_MESSAGE, payload: {showMessage: false} }), time)
    }
}

const errorToMessage = {
    'auth/wrong-password': "Your login and password do not match.",
    'auth/user-not-found': "No user found with the specified credentials.",
    'auth/popup-closed-by-user': 'Login process terminated. Please try again.',
    'auth/too-many-requests': 'Request timeout encountered. Please try again later.'
}


export { 
    flashMessage, 
    errorToMessage
}
