import React, { ReactNode } from 'react'
import ThemedContainer from '../ThemedContainer/ThemedContainer'
import Loading from '../Loading/Loading'

import styles from './StyledContainer.module.css'

/**
 * Application page container component
 * styled with a background image and
 * decorative elements
 * 
 * @param props Properties to be passed into the component
 * @param props.children Child component to be rendered inside the component
 * @return
 */
export default function StyledContainer(props: { children: ReactNode }) {
    const {
        children
    } = props

    return (
        <ThemedContainer>
            <div className={styles.homeContainer}>
                <div className={styles.circleContainer}>
                    <div
                        className={`
                            ${styles.decorCircle}
                            ${styles.blueCircle} 
                            ${styles.XsmallCircle} 
                            ${styles.id1}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.pinkCircle} 
                            ${styles.mediumCircle}
                            ${styles.id2}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.pinkCircle} 
                            ${styles.XlargeCircle}
                            ${styles.id3}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle}
                            ${styles.blueCircle}
                            ${styles.XXsmallCircle}
                            ${styles.id4}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle}
                            ${styles.purpleCircle} 
                            ${styles.mediumCircle} 
                            ${styles.id5}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.blueCircle} 
                            ${styles.smallCircle}
                            ${styles.id6}
                        `}
                    />
                </div>
                {children ? children : <Loading />}
            </div>
        </ThemedContainer>
    )
}