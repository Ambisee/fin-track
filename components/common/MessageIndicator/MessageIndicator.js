/**
 * /components/common/MessageIndicator/MessageIndicator.js
 * 
 * An indicator component to indicate the 
 * status of an action performed by the user
 */
import { motion } from "framer-motion";

import styles from './MessageIndicator.module.css'

// Indicator CSS classes for different severity level
const messageSeverity = {
    info: styles.info,
    warning: styles.warning,
    error: styles.error
}

export default function MessageIndicator(props) {
    /**
     * state: Object =
     *      The object containing information about the 
     *      message to be displayed
     */
    const {
        state,
        className
    } = props
    
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            className={`
                ${styles.messageIndicator}
                ${messageSeverity[state.type]}
                ${className}
            `}
        >
            {state.message}
        </motion.div>
    )
}