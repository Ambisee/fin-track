/**
 * components/home_page/InputField/VisibilityToggler.js
 * 

 */
import styles from './InputField.module.css'

/**
 * Part of the InputField component. Contains the button component
 * that toggles or detoggles visibility of the value of an InputField
 * with the `password` `type`
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component
 * @param {Function} props.toggleOn
 *      callback function that fires off when the button is toggled
 * @param {Function} props.toggleOff
 *      callback function that fires off when the button is not toggled
 * @param {Boolean} props.isVisible
 *      The boolean value that shows whether or not the InputField's value is visible
 * @returns 
 */
export default function VisibilityToggler(props) {
    const {
        toggleOn,
        toggleOff,
        isVisible
    } = props

    return (
        <button
            type="button"
            tabIndex={-1}
            className={styles.visibilityToggler}
            onMouseDown={toggleOn}
            onMouseLeave={toggleOff}
            onMouseUp={toggleOff}
        >
            {isVisible ?
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <path id="Eye_Icon_Crossed_1" data-name="Eye Icon (Crossed) 1" d="M19.176,174.533L174.36,18.988l6.464,6.479L25.64,181.012ZM83.355,100a9.093,9.093,0,0,0,3.905-.886l-19.1,19.149A32.119,32.119,0,0,1,62.409,100c0-19.117,17.087-34.614,38.165-34.614a41.231,41.231,0,0,1,16.809,3.536l-25.737,25.8A9.17,9.17,0,1,0,83.355,100Zm17.219-40.383c-48.092,0-68.061,26.872-81.5,40.383,7.933,7.974,18.415,21.542,36.648,30.729l-8.207,8.227C27.989,127.973,15.065,112.127,3,100c21.841-21.953,43.428-51.921,97-51.921a110.782,110.782,0,0,1,33.329,4.861l-9.3,9.317A102.032,102.032,0,0,0,100.574,59.617Zm-17.594,71.1,49.536-49.65A32.192,32.192,0,0,1,138.739,100c0,19.117-17.087,34.614-38.165,34.614A41.144,41.144,0,0,1,82.98,130.714Zm16.446,9.669c48.092,0,71.317-30.145,81.5-40.383-6.393-6.426-17.525-20.754-36.881-30.5l8.34-8.359C172.417,72.375,185.586,88.527,197,100c-18.528,18.623-43.428,51.921-97,51.921a112.28,112.28,0,0,1-33.415-4.773l9.244-9.266A106.989,106.989,0,0,0,99.426,140.383Z"/>
                </svg> :
                <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
                    <path id="Eye_Icon_1" data-name="Eye Icon 1" d="M100.5,151C47.757,151,25.17,120.226,5,100c21.5-21.563,42.757-51,95.5-51s76.572,32.019,95.5,51C177.759,118.292,153.243,151,100.5,151Zm0.565-90.667c-47.348,0-67.008,26.4-80.242,39.667,12.619,12.654,31.765,39.667,79.112,39.667S170.149,110.056,180.178,100C170.176,89.971,148.413,60.333,101.065,60.333Zm0,73.667c-20.752,0-37.575-15.222-37.575-34s16.823-34,37.575-34,37.575,15.222,37.575,34S121.817,134,101.065,134ZM84.112,81.867a9.067,9.067,0,1,0,9.041,9.067A9.054,9.054,0,0,0,84.112,81.867Z" />
                </svg>
            }
        </button>
    )
}