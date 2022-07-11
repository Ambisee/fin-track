import Image from 'next/image'

import styles from './ProviderLoginButton.module.css'
import defaultImage from '../../../public/google-logo.png'

export default function ProviderLoginButton({providerName, imgSrc=defaultImage, onClick, logoBgColor}) {
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