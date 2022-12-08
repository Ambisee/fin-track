import Head from "next/head"
import Link from "next/link"
import { useState, useRef } from "react"
import { motion } from "framer-motion"

import { flashMessage } from '../../components/common/utils'
import DashboardActionButton from "../../components/dashboard_page/DashboardActionButton/DashboardActionButton"
import DashboardFormField from "../../components/dashboard_page/DashboardFormField/DashboardFormField"
import DashboardLayout, { useLayoutReducer } from "../../components/dashboard_page/DashboardLayout/DashboardLayout"
import DashboardTable from "../../components/dashboard_page/DashboardTable/DashboardTable"
import { TOGGLE_MESSAGE, HOVER, REDIRECT } from "../../components/dashboard_page/dispatcher"
import {INFO, ERROR} from '../../components/common/MessageIndicator/MessageIndicator'
import { useFirestore } from "../../firebase/firestore"
import { Entry, Money } from "../../firebase/firestore_classes"
import { useAuth } from "../../firebase/auth"

import styles from "./styles/index.module.css"

const tableConfig = {    
  headers: ["detail", "amount"],
  columnWidths: [
    { width: "50%", minWidth: "20rem" },
    { width: "30%", minWidth: "12.5rem" },
    { width: "20%", minWidth: "5rem" }
  ]
}

/**
 * Dashboard home page component
 * @returns
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
  const { navDispatch } = useLayoutReducer()
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
            navDispatch({type: TOGGLE_MESSAGE, payload: {type: INFO, showMessage: true, message: 'Adding entry...'}})
            setTimeout(() => navDispatch({type: TOGGLE_MESSAGE, payload: {showMessage: false}}), 10000)
            
            // Check if amount is valid
            if (!Money.isValidAmount(newAmount)) {
              flashMessage(navDispatch, 'Invalid amount entered', ERROR, 2000)
              return
            }

            const newEntry = new Entry(new Date(newDate), newDetail, new Money(newAmount))

            firestore.addEntry(
              newEntry,
              () => {
                setNewAmount("")
                setNewDate("")
                setNewDetail("")
                flashMessage(navDispatch, 'Entry added!', INFO, 2000)
              },
              (error) => flashMessage(navDispatch, `An unknown error occured: ${error}`, ERROR, 2000)
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
            data={firestore.entryData}
            deleteRowCallback={(id) => {
              firestore.deleteEntry(
                id, 
                () => flashMessage(navDispatch, "Entry deleted", INFO, 2000),
                (error) => flashMessage(navDispatch, `An unknown error occured: ${error}`, ERROR, 2000),
              )
            }}
          />
        {
          firestore.entryData.length > 0 &&
          <Link href='/dashboard/records' passHref>
            <a 
              className={styles.moreEntriesLink}
              onClick={() => {
                navDispatch({ type: REDIRECT, value: 2 })
                navDispatch({type: HOVER, value: 2})
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
