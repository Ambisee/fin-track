import { motion } from "framer-motion";

import styles from './MessageIndicator.module.css'

const messageSeverity = {
    info: styles.info,
    warning: styles.warning,
    error: styles.error
}

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