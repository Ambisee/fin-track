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
                            ${styles.pinkCircle} 
                            ${styles.mediumCircle} 
                            ${styles.first}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.purpleCircle} 
                            ${styles.smallCircle}
                            ${styles.first}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.cyanCircle} 
                            ${styles.XlargeCircle}
                            ${styles.first}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle}
                            ${styles.cyanCircle}
                            ${styles.largeCircle}
                            ${styles.second}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle}
                            ${styles.purpleCircle} 
                            ${styles.XsmallCircle} 
                            ${styles.second}
                        `}
                    />
                    <div
                        className={`
                            ${styles.decorCircle} 
                            ${styles.purpleCircle} 
                            ${styles.mediumCircle}
                            ${styles.third}
                        `}
                    />
                </div>
                {children}
            </div>
        </ThemedContainer>
    )
}