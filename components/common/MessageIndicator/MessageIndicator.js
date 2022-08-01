import { motion } from "framer-motion";

import styles from './MessageIndicator.module.css'

/** Indicator CSS classes for different severity level */
const messageSeverity = {
    info: styles.info,
    warning: styles.warning,
    error: styles.error
}

/**
 * An indicator component to indicate the 
 * status of an action performed by the user
 *  
 * @param {Object} props
 *      Properties that will be passed into the component
 * @param {Object} props.state
 *      Object that contains data required to display the indicator.
 *      The object must be in the following format:
 *          {
 *              type: `The severity level of the message` - String
 *              message: `The message to be displayed` - String | React.Component
 *          }
 * @param {String} props.className
 *      Additional CSS classes that will be passed down to the component
 * @returns 
 */
export default function MessageIndicator(props) {
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