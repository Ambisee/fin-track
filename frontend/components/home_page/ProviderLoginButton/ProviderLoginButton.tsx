import Image from 'next/image'

import styles from './ProviderLoginButton.module.css'
import defaultImage from '../../../public/images/google-logo.png'

/**
 * The button component used to sign the user in
 * through a provider (i.e. Google, Facebook, etc.)
 * 
 * @param {Object} props 
 *      The properties that will be passed down to the component
 * @param {String} props.providerName
 *      The provider's name that will be used for the button's display
 * @param {*} props.imgSrc
 *      The image of the provider's logo that will be used for the button's display
 * @param {Function} props.onClick
 *      The login function when the button is clicked
 * @param {String} props.logoBgColor
 *      The background color that will be used within the logo display in case
 *      the image is too small. Defaults to `white` 
 * @returns 
 */
export default function ProviderLoginButton(props) {
    const {
        providerName, 
        imgSrc = defaultImage, 
        onClick, 
        logoBgColor = 'white'
    } = props

    return (
        <button className={styles.providerLoginButton} onClick={onClick}>
            <div style={{backgroundColor: logoBgColor}}>
                <Image
                    src={imgSrc}
                    alt="Provider Logo.jpg"
                    loading="eager"
                    layout="fixed"
                    width="25"
                    height="25"
                />
            </div>
            <p>
                Sign in with {providerName}
            </p>
        </button>
    )
}