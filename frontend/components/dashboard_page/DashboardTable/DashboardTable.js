import { motion } from 'framer-motion'
import { useRef } from 'react'

import styles from './DashboardTable.module.css'

/**
 * The dashboard table that will be used
 * to display user data
 * 
 * @param {Object} props 
 *      Properties that will be passed down to the component
 * @param {Object} props.config 
 *      Configuration that will determine how to render the table.
 * 
 *      Format:
 *      {
 *          headers: [details, ...],
 *          columnWidths: [{width: '10%', minWidth: '20rem'}, {width: '40%', minWidth: '30rem'}, ...]
 *      }
 * @param {Array} props.config.headers
 *      The data that will be rendered in the table's headers
 * 
 *      Note: `id` and `date` are special headers - Do not include these 
 *      headers in the config.headers array.
 *      - `id` will not be rendered in a column
 *      - `date` will be rendered at the left-most side of the table
 * @param {Array} props.config.columnWidths
 *      An array of Objects containing the styles for defining the widths
 *      of each table columns
 * @param {Array} props.data
 *      An array of Objects containing query data to be rendered
 * @param {Function} props.deleteRowCallback
 *      A callback function to bind to the delete button on the end of the row
 * @param {String} className
 *      Additional CSS classes that will be passed down to the internal <table> element
 * @returns 
 */
export default function DashboardTable(props) {
    const {
        config,
        data,
        deleteRowCallback,
        className
    } = props

    const tableContainer = useRef(null)

    /**
     * Validating the `header` part of the data
     */
    if (config?.headers === null || config?.headers === undefined) {
        return <div className={styles.emptyTable}>No data available</div>
    }

    if (data < 1) {
        return <div className={styles.emptyTable}>No data available</div>
    }

    /**
     * Convert a date-like object into a string
     * 
     * @param {String} date
     *      The date-like object to be converted into datestring
     * @returns {String} 
     */
    const convertDate = (date) => {
        return new Date(date).toLocaleDateString().split('/').join('-')
    }

    return (
        <div 
            className={`
                ${styles.tableContainer}
                ${className}
            `}
        >
            <div>
                <table className={styles.leftColumn}>
                    <thead>
                        <tr><th>Date</th></tr>
                    </thead>
                    <tbody>
                        {
                            data.map(query => (
                                <tr key={query.id}>
                                    <td>{convertDate(query.date)}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            <div>
                <motion.div className={styles.scrollTableContainer} ref={tableContainer}>
                    <motion.table
                        className={styles.scrollTable}
                        drag="x"
                        dragConstraints={tableContainer}
                    >
                        <colgroup>
                            {config.columnWidths.map((obj, i) => (
                                <col key={i} style={obj} />
                            ))}
                        </colgroup>
                        <thead>
                            <tr>
                                {config.headers.map((header, i) => (
                                    <th key={header}>{header}</th>
                                ))}
                                <th>X</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                data.map(query => (
                                    <tr key={query.id}>
                                        {config.headers.map((header, i) => (
                                            <td 
                                                key={`${header} ${query.id}`}
                                            >
                                                <span>{query[header]}</span>
                                            </td>
                                        ))}
                                        <td>
                                            <button
                                                type="button"
                                                className={styles.deleteEntryButton}
                                                onClick={() => deleteRowCallback(query.id)}
                                            >
                                                X
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            }
                        </tbody>
                    </motion.table>
                </motion.div>
            </div>
        </div>
    )
}