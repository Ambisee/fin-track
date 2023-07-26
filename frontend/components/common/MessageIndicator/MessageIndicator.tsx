import { Variants, motion } from "framer-motion"

import styles from "./MessageIndicator.module.css"
import { 
  IndicatorProps,
  SeverityLevel,
} from "./types"

/** Indicator CSS classes for different severity level */
const messageSeverity: {[key in SeverityLevel]: string} = {} as {[key in SeverityLevel]: string}

messageSeverity.INFO = styles.info
messageSeverity.WARNING = styles.warning
messageSeverity.ERROR = styles.error

const toggleDuration = 0.25
const indicatorVariants: Variants = {
  visible: { 
    opacity: 1,
    visibility: "visible",
    transition: {
      opacity: {duration: toggleDuration}
    }
  },
  hidden: {
    opacity: 0,
    visibility: "hidden",
    transition: {
      opacity: {duration: toggleDuration},
      visibility: {delay: toggleDuration}
    }
  }
}

/**
 * An indicator component to indicate the
 * status of an action performed by the user
 *
 * @param props Properties that will be passed into the component.
 * @param props.state Object that contains data required to display the indicator.
 * @param props.className Additional CSS classes that will be passed down to the component.
 * @param props.onClose Callback function called when the close button is pressed. 
 *    If provided, a close button will appear on the indicator.
 * @return
 */
export default function MessageIndicator(props: IndicatorProps) {
  const { 
    state,
    className,
    onClose = undefined
  } = props

  return (
    <motion.div
      variants={indicatorVariants}
      initial={false}
      animate={state.show ? "visible" : "hidden"}
      className={`
        ${styles.messageIndicator}
        ${messageSeverity[state.type]}
        ${className}
      `}
    >
      <div className={styles.indicatorBody}>
        {state.message}
      </div>
      {(onClose !== undefined) &&
        <button onClick={onClose} className={styles.indicatorCloser}>
          X
        </button>
      }
    </motion.div>
  )
}
