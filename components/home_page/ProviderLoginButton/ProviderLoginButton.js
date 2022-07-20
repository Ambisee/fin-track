/**
 * components/home_page/ProviderLoginButton/ProviderLoginButton.js
 * 
 * The button component used to sign the user in
 * through a provider (i.e. Google, Facebook, etc.)
 */

import Image from 'next/image'

import styles from './ProviderLoginButton.module.css'
import defaultImage from '../../../public/google-logo.png'

export default function ProviderLoginButton(props) {
    /**
     * providerName: String =
     *      The provider's name that will be used for the button's display
     * imgSrc: ~ =
     *      The image of the provider's logo that will be used for the button's display
     * onClick: Function =
     *      The login function when the button is clicked
     * logoBgColor: String =
     *      The background color that will be used within the logo display in case
     *      the image is too small. Defaults to `white`
     */
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