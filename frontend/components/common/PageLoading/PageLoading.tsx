import Head from 'next/head'
import { CSSProperties } from 'react'

import styles from './PageLoading.module.css'
import circleStyles from '../StyledContainer/StyledContainer.module.css'

/**
 * <PageLoading />
 * 
 * A full page loading indicator component. Used
 * as a placeholder when the page is not ready to be
 * displayed.
 * 
 * @return
 */
export default function PageLoading() : JSX.Element {
    return (
        <>
            <Head>
                <title>{process.env.NEXT_PUBLIC_TITLE}</title>
                <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0"></meta>
                <meta name="description" content="Your reliable solution to keep track of your daily cash flow"></meta>
            </Head>
            <div className={styles.pageContainer}>
                <div className={styles.loadingWrapper}>
                    <div
                        className={`
                            ${circleStyles.decorCircle}
                            ${circleStyles.blueCircle}
                            ${styles.first}
                        `}
                        style={{'--data-order': 1} as CSSProperties}
                    ></div>
                    <div
                        className={`
                            ${circleStyles.decorCircle}
                            ${circleStyles.purpleCircle}
                            ${styles.second}
                        `}
                        style={{'--data-order': 2} as CSSProperties}
                    ></div>
                    <div
                        className={`
                            ${circleStyles.decorCircle}
                            ${circleStyles.pinkCircle}
                            ${styles.third}
                        `}
                        style={{'--data-order': 3} as CSSProperties}
                    ></div>
                </div>
            </div>
        </>
    )
}