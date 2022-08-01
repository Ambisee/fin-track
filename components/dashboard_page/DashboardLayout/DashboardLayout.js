import React from "react"
import { useRouter } from "next/router"
import { AnimatePresence } from "framer-motion"

import { useAuth } from "../../../firebase/auth"
import { useNavReducer, TOGGLE_SIDEBAR } from "../dispatcher"
import MessageIndicator from "../../common/MessageIndicator/MessageIndicator"
import DashboardSideNav from "../DashboardSideNav/DashboardSideNav"
import DashboardTopNav from "../DashboardTopNav/DashboardTopNav"
import Loading from "../../common/Loading/Loading"

import styles from "./DashboardLayout.module.css"

/**
 * General layout component used within the dashboard.
 * Consists the dashboard navigation bars and an area to display the content
 *
 * @param {Object} props
 *      Properties to be passed to the component.
 * @param {React.Component} props.children
 *      React component to be rendered within the layout.
 * @param {Number} props.pageIndex
 *      The page index number of the current page
 * @returns
 */
export default function DashboardLayout(props) {
  const { 
    children, 
    pageIndex 
  } = props

  /**
   * navToggle: Boolean =
   *      boolean value used in mobile viewports denoting whether
   *      the side navigation bar is toggled or not
   * [navState, navDispatch]: Array(Object, Function)
   *      The dashboard navbar's `state` Object and `dispatch` function
   * auth: Object =
   *      The object that contains the current user's credentials
   * router: ~ =
   *      The router hook used to redirect the user to another page
   */
  const [navState, navDispatch] = useNavReducer(pageIndex)
  const auth = useAuth()
  const router = useRouter()

  if (auth.user === undefined) {
    return <Loading />
  }

  if (auth.user === null && auth.user !== undefined) {
    router.push("/")
    return <></>
  }

  if (!auth.user.emailVerified) {
    router.push("/awaiting-verification")
    return <></>
  }

  return (
    <div className={styles.dashboardLayout}>
      {/* Navigation Bar */}
      <DashboardSideNav
        pageIndex={pageIndex}
        onRedirect={() => navDispatch({ type: TOGGLE_SIDEBAR, value: false })}
        className={`${navState.isSideBarToggled && styles.displayNav} ${
          styles.sideNav
        }`}
        navState={navState}
        navDispatch={navDispatch}
      />
      <DashboardTopNav
        profileImage={auth.user}
        className={styles.topNav}
        navState={navState}
        navDispatch={navDispatch}
        sideBarCallback={() =>
          navDispatch({ type: TOGGLE_SIDEBAR, value: true })
        }
      />

      {/* Filter div element to be toggled when the side navigation bar is visible */}
      <div
        className={`${styles.darkFilter} ${
          navState.isSideBarToggled && styles.displayNav
        }`}
        onClick={() => {
          navDispatch({ type: TOGGLE_SIDEBAR, value: false })
        }}
      />

      {/* Status popup */}
      <AnimatePresence>
        {
            navState.messageIndicator.showMessage &&
            <MessageIndicator state={navState.messageIndicator} className={styles.indicatorPos} />
        }
      </AnimatePresence>

      {/* Content */}
      <div className={styles.content}>{children}</div>
    </div>
  )
}
