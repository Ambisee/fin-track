import Image from 'next/image'
import {useSwiper} from 'swiper/react'

import goRightArrow from '../../../public/go-right-arrow.svg'
import styles from './HeroLeft.module.css'

/**
 * The left section of the landing page's hero section
 * where the header, brief description, and quick links 
 * will be displayed 
 * 
 * @returns 
 */
export default function HeroLeft() {
    /**
     * swiper: ~ =
     *      reference to the Swiper component. Used to retrieve a callback function
     *      for the Swiper
     */
    const swiper = useSwiper()

    return (
        <div className={styles.heroLeftWrapper}>
            <div className={styles.heroLeft}>
                <header className={styles.heroHeader}>
                    <span>FinTrack</span> lets you take
                    <h1>Personal Finance</h1>
                    into <span>your own hands</span>,
                </header>
                <p>
                    Financial management at
                    the tip of your fingers. Record 
                    and track your daily income
                    and expenses with ease.
                </p>
                <div className={styles.heroLinks}>
                    <button className={`${styles.darkTheme} ${styles.loginLink}`} onClick={() => swiper.slideTo(1)}>Go to login</button>
                    <a className={styles.lightTheme}>Learn more</a>
                </div>
                <button className={styles.scrollRightButton} onClick={() => swiper.slideTo(1)}>
                    <Image
                        src={goRightArrow}
                        alt="go-right-arrow.svg"
                        className={styles.goRightIcon}
                        width={40}
                        height={40}
                        layout="fixed"
                    />
                    <span className={styles.scrollRightSpan}>Swipe to Login</span>
                </button>
            </div>
        </div>
    )
}