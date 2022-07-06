import Image from 'next/image'
import dynamic from 'next/dynamic'

import backgroundImage from '../../../public/background.png'
import styles from './ThemedContainer.module.css'

export default function ThemedContainer({ children }) {
    return (
        <div className={styles.background}>
            {backgroundImage &&
                <Image
                    className={styles.bgImage}
                    src={backgroundImage}
                    alt="Background.jpg"
                    placeholder='blur'
                    objectFit="cover"
                    loading="eager"
                    priority={true}
                    layout="fill"
                /> 
            }
            {children}
        </div>
    )
}