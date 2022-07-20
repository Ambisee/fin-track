/**
 * /components/common/StyledContainer/StyledContainer.js
 * 
 * Application page container component
 * styled with a background image and
 * decorative elements
 */
import styles from './StyledContainer.module.css'
import ThemedContainer from '../ThemedContainer/ThemedContainer'

export default function HomeContainer({ props, children }) {
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
                {children}
            </div>
        </ThemedContainer>
    )
}