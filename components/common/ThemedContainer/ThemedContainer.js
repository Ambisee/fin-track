import Image from "next/image"
import React from "react"

import backgroundImage from "../../../public/background(1).png"
import styles from "./ThemedContainer.module.css"

/**
 * Page container component styled with
 * a background image
 *
 * @param {Object} props
 *      Properties that will be passed down to the component
 * @param {React.Component} props.children
 *      The child components that will be rendered inside of the component
 * @returns
 */
export default function ThemedContainer(props) {
    const { children } = props

    return (
        <div className={styles.background}>
        {backgroundImage && (
            <Image
            className={styles.bgImage}
            src={backgroundImage}
            alt="Background.jpg"
            objectFit="cover"
            loading="eager"
            priority={true}
            layout="fill"
            />
        )}
        {children}
        </div>
    )
}
