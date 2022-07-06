import { SHOW_MESSAGE, UNSHOW_MESSAGE } from "./dispatcher";

function flashMessage(dispatch, message, type, time) {
    dispatch({ type: SHOW_MESSAGE, payload: { message: message, type: type } })
    setTimeout(() => dispatch({ type: UNSHOW_MESSAGE }), time)
}

export { flashMessage }