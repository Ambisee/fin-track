import { createContext, useContext, useEffect, useRef } from "react"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/router"

import { pageIndexMap } from "../utils"
import { useAuth } from "../../../firebase/auth"
import FirestoreProvider from "../../../firebase/FirestoreProvider"
import MessageIndicator from "../../common/MessageIndicator/MessageIndicator"
import DashboardSideNav from "../DashboardSideNav/DashboardSideNav"
import DashboardTopNav from "../DashboardTopNav/DashboardTopNav"
import Loading from "../../common/Loading/Loading"
import { NavContextObject } from "../types"
import {
  useNavReducer,
  TOGGLE_SIDEBAR,
  TOGGLE_DROPDOWN,
  REDIRECT,
  HOVER,
} from "../dispatcher"

import styles from "./DashboardLayout.module.css"

const NavContext = createContext<NavContextObject>({} as NavContextObject)

export function useLayoutReducer() {
  return useContext<NavContextObject>(NavContext)
}

/**
 * Component for authentication check and rendering the general dashboard layout.
 * Consists the dashboard navigation bars and an area to display the content
 *
 * @param {Object} props
 *      Properties to be passed to the component.
 * @param {Component} props.children
 *      React component to be rendered within the layout.
 * @param {Number} props.pageIndex
 *      The page index number of the current page
 * @returns
 */
export default function DashboardLayout(props) {
  const { children, pageIndex } = props

  /**
   * navState: Object =
   *    The object that contains the state for conditional renderings in the layout
   * navDispatch: Function =
   *
   * auth: Object =
   *      The object that contains the current user's credentials
   * router: ~ =
   *      The router hook used to redirect the user to another page
   */
  const auth = useAuth()
  const router = useRouter()
  const topNavProfileRef = useRef<HTMLElement>()
  const {navState, navDispatch} = useNavReducer(pageIndex)

  useEffect(() => {
    // Change the page link the side bar is currently hovering when the back or forward button is clicked
    router.beforePopState(({ as }) => {
      navDispatch({ type: REDIRECT, value: pageIndexMap[as] })
      navDispatch({ type: HOVER, value: pageIndexMap[as] })
      router.push(as)
      return true
    })
  }, [navDispatch, router])

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
    <NavContext.Provider value={{navState, navDispatch}}>
      <FirestoreProvider>
        <div
          className={styles.dashboardLayout}
          onClick={(e) => {
            if (!topNavProfileRef.current.contains(e.target as Node)) {
              navDispatch({ type: TOGGLE_DROPDOWN, value: false })
            }
          }}
        >
          {/* Navigation Bar */}
          <DashboardSideNav
            // pageIndex={pageIndex}
            onRedirect={() =>
              navDispatch({ type: TOGGLE_SIDEBAR, value: false })
            }
            className={`${navState.isSideBarToggled && styles.displayNav} ${
              styles.sideNav
            }`}
            navState={navState}
            navDispatch={navDispatch}
          />
          <DashboardTopNav
            navState={navState}
            className={styles.topNav}
            // profileImage={auth.user}
            navDispatch={navDispatch}
            profileInfoRef={topNavProfileRef}
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
            {navState.messageIndicator.showMessage && (
              <MessageIndicator
                state={navState.messageIndicator}
                className={styles.indicatorPos}
              />
            )}
          </AnimatePresence>

          {/* Content */}
          <div className={styles.content}>{children}</div>
        </div>
      </FirestoreProvider>
    </NavContext.Provider>
  )
}
