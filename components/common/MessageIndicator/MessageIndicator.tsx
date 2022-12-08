import { motion } from "framer-motion"

import styles from "./MessageIndicator.module.css"
import { IndicatorState, IndicatorStatus } from "./types"

/** Message Severity Variables */
const INFO = "INFO"
const WARNING = "WARNING"
const ERROR = "ERROR"

/** Indicator CSS classes for different severity level */
const messageSeverity: {[key in IndicatorStatus]: string} = {} as {[key in IndicatorStatus]: string}
messageSeverity.INFO = styles.info
messageSeverity.WARNING = styles.warning
messageSeverity.ERROR = styles.error

/**
 * An indicator component to indicate the
 * status of an action performed by the user
 *
 * @param props Properties that will be passed into the component
 * @param props.state Object that contains data required to display the indicator.
 * @param props.className Additional CSS classes that will be passed down to the component
 * @return
 */
export default function MessageIndicator(props: {
  state: IndicatorState,
  className: string
}) {
  const { state, className } = props

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
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

export { INFO, WARNING, ERROR }
