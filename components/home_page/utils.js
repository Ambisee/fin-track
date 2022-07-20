/**
 * /components/home_page/utils.js
 * 
 * Defines utility function used within
 * the landing page
 */
import { SHOW_MESSAGE, UNSHOW_MESSAGE } from "./dispatcher";

function flashMessage(dispatch, message, type, time) {
    /**
     * Utility function to display a message for a period of time
     * 
     * dispatch: Function =
     *      the dispatch function that manipulates the state of the
     *      message indicator
     * message: String =
     *      the message to be displayed
     * type: String =
     *      the severity type of the message to be displayed
     * time: Integer =
     *      the amount of time the image will be displayed for in milliseconds 
     */
    dispatch({ type: SHOW_MESSAGE, payload: { message: message, type: type } })
    setTimeout(() => dispatch({ type: UNSHOW_MESSAGE }), time)
}

export { flashMessage }