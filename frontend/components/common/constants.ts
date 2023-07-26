const TOGGLE_MESSAGE = 'TOGGLE_MESSAGE'

const errorToMessage = {
    'auth/wrong-password': "Your login and password do not match.",
    'auth/user-not-found': "No user found with the specified credentials.",
    'auth/popup-closed-by-user': 'Login process terminated. Please try again.',
    'auth/too-many-requests': 'Request timeout encountered. Please wait and try again later.'
}

export { errorToMessage, TOGGLE_MESSAGE }
