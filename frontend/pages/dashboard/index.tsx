import Head from "next/head"
import Link from "next/link"
import { useState, useRef } from "react"
import { motion } from "framer-motion"

import DashboardActionButton from "../../components/dashboard_page/DashboardActionButton/DashboardActionButton"
import DashboardFormField from "../../components/dashboard_page/DashboardFormField/DashboardFormField"
import DashboardLayout from "../../components/dashboard_page/DashboardLayout/DashboardLayout"
import DashboardTable from "../../components/dashboard_page/DashboardTable/DashboardTable"
import { flashMessage } from '../../components/common/helper'
import { useDashboardContext } from "../../components/dashboard_page/context"
import { HOVER, REDIRECT } from "../../components/dashboard_page/constants"
import { TOGGLE_MESSAGE } from '../../components/common/constants'
import { INFO, ERROR } from '../../components/common/MessageIndicator/constants'
import { useFirestore } from "../../firebase/firestore"
import { Entry, Money } from "../../firebase/firestoreClasses"
import { useAuth } from "../../firebase/auth"

import styles from "../../public/css/dashboard/index.module.css"
import { validateData } from "../../components/dashboard_page/helper"

const homeRecordLimit = 15
const tableConfig = {    
  headers: ["detail", "amount"],
  columnWidths: [
    { width: "50%", minWidth: "20rem" },
    { width: "30%", minWidth: "9.5rem" },
    { width: "10%", minWidth: "3rem" }
  ]
}

/**
 * Dashboard home page component
 * @return
 */
export default function DashboardHomePage() {
  /**
   * newDetail: String =
   *    The `detail` section of the new entry
   * newDate: Date =
   *    The `date` section of the new entry
   * newDetail: String =
   *    The `amount` section of the new entry
   * formContainer: React.MutableRefObject =
   *    The `ref` object that points to the container <div> 
   *    element that holds the entry form fields
   * auth: Object =
   *    Object containing the authentication context
   */
  const auth = useAuth()
  const formContainer = useRef()
  const firestore = useFirestore()
  const { dispatch } = useDashboardContext()
  const [newDetail, setNewDetail] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newAmount, setNewAmount] = useState("")

  return (
    <div className={styles.dashboardHome}>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard`}</title>
      </Head>
      <h3>
        Welcome back,
        <span>{` ${auth?.user.displayName || auth?.user.email.split("@")[0]}`}</span>
      </h3>

      {/* New Entry Form */}
      <div className={styles.newEntryForm}>
        <span className={styles.mainHeader}>Add a new entry :</span>
        <form 
          onSubmit={(e) => {
            e.preventDefault()
            dispatch({type: TOGGLE_MESSAGE, payload: {show: true, message: 'Adding entry...', type: INFO}})
            setTimeout(() => dispatch({
              type: TOGGLE_MESSAGE, 
              payload: {
                message: 'Adding entry...', 
                type: INFO, 
                show: false
              }
            }), 10000)
            
            // Check if amount is valid
            if (!Money.isValidAmount(newAmount)) {
              flashMessage(dispatch, 'Please enter a valid amount.', ERROR, 2000)
              return
            }

            const d = new Date(newDate)
            if (isNaN(d.getDate())) {
              flashMessage(dispatch, 'Please enter a valid date.', ERROR, 2000)
              return
            }

            const payload = validateData(dispatch, newAmount, newDetail, newDate)
            if (payload[0] === undefined) {
              return
            }
            
            const newEntry = new Entry(...payload)

            firestore.addEntry(
              newEntry,
              () => {
                setNewAmount("")
                setNewDate("")
                setNewDetail("")
                flashMessage(dispatch, 'Entry added!', INFO, 2000)
              },
              (error) => flashMessage(dispatch, `An unknown error occured: ${error}`, ERROR, 2000)
            )
          }}
        >
          <motion.div className={styles.entryFormContainer} ref={formContainer}>
            <motion.div
              className={styles.innerContainer}
              whileHover={{
                cursor: "grab",
              }}
              drag="x"
              dragConstraints={formContainer}
            >
              <DashboardFormField
                name="Date"
                type="date"
                required
                withLabel={false}
                onChange={(e) => {
                  setNewDate(e.target.value)
                }}
                value={newDate}
              />
              <DashboardFormField
                name="Detail"
                type="text"
                required
                withLabel={false}
                onChange={(e) => {
                  setNewDetail(e.target.value)
                }}
                value={newDetail}
                className={styles.detailsForm}
              />
              <DashboardFormField
                name="Amount"
                type="text"
                required
                withLabel={false}
                onChange={(e) => {
                  setNewAmount(e.target.value)
                }}
                value={newAmount}
              />
            </motion.div>
          </motion.div>
          <div className={styles.entryButtonContainer}>
            <DashboardActionButton className={styles.addEntryButton}>
              Add entry
            </DashboardActionButton>
            <DashboardActionButton 
              className={styles.clearEntryButton}
              type="button"
              onClick={() => {
                setNewAmount("")
                setNewDate("")
                setNewDetail("")
              }}
            >
              Clear
            </DashboardActionButton>
          </div>
        </form>
      </div>
      <section>
        <span className={styles.mainHeader}>Most recent entries</span>
        <DashboardTable 
            className={styles.mostRecentEntries}
            config={tableConfig}
            data={firestore.entryData.slice(0, homeRecordLimit)}
            deleteRowCallback={(id) => {
              flashMessage(dispatch, "Loading...", INFO)

              firestore.deleteEntry(
                id, 
                () => flashMessage(dispatch, "Entry deleted", INFO, 2000),
                (error) => flashMessage(dispatch, `An unknown error occured: ${error}`, ERROR, 2000),
              )
            }}
          />
        {
          firestore.entryData.length > 0 &&
          <Link href='/dashboard/records' passHref>
            <a 
              className={styles.moreEntriesLink}
              onClick={() => {
                dispatch({ type: REDIRECT, value: 2 })
                dispatch({ type: HOVER, value: 2 })
              }}
            >
              More entries
            </a>
          </Link>
        }
      </section>
    </div>
  )
}

DashboardHomePage.getLayout = function getLayout(page) {
  return <DashboardLayout pageIndex={0}>{page}</DashboardLayout>
}
