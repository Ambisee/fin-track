import { useEffect, useRef } from "react"
import { useRouter } from "next/router"

import { useAuth } from "../../../firebase/auth"
import MessageIndicator from "../../common/MessageIndicator/MessageIndicator"
import DashboardSideNav from "../DashboardSideNav/DashboardSideNav"
import DashboardTopNav from "../DashboardTopNav/DashboardTopNav"
import PageLoading from "../../common/PageLoading/PageLoading"
import { NavContext } from "../context"
import { useNavReducer } from "../dispatcher"
import { 
  pageIndexMap, 
  REDIRECT, 
  HOVER, 
  TOGGLE_DROPDOWN, 
  TOGGLE_SIDEBAR 
} from "../constants"

import styles from "./DashboardLayout.module.css"

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
 * @return
 */
export default function DashboardLayout(
  props: {
    children: JSX.Element, 
    pageIndex: number
  }
) : JSX.Element {
  const { children, pageIndex } = props

  const auth = useAuth()
  const router = useRouter()
  const topNavProfileRef = useRef<HTMLElement>()
  const [state, dispatch] = useNavReducer(pageIndex)

  useEffect(() => {
    // Change the page link the side bar is currently hovering when the back or forward button is clicked
    router.beforePopState(({ as }) => {
      dispatch({ type: REDIRECT, value: pageIndexMap[as] })
      dispatch({ type: HOVER, value: pageIndexMap[as] })
      router.push(as)
      return true
    })
  }, [dispatch, router])

  if (auth.user === undefined) {
    return <PageLoading />
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
    <NavContext.Provider value={{state, dispatch}}>
      <div
        className={styles.dashboardLayout}
        onClick={(e) => {
          if (!topNavProfileRef.current.contains(e.target as Node)) {
            dispatch({ type: TOGGLE_DROPDOWN, value: false })
          }
        }}
      >
        {/* Navigation Bar */}
        <DashboardSideNav
          onRedirect={() =>
            dispatch({ type: TOGGLE_SIDEBAR, value: false })
          }
          className={`${state.isSideBarToggled && styles.displayNav} ${
            styles.sideNav
        }`}
        />
        <DashboardTopNav
          className={styles.topNav}
          profileInfoRef={topNavProfileRef}
          sideBarCallback={() =>
            dispatch({ type: TOGGLE_SIDEBAR, value: true })
          }
        />

        {/* Filter div element to be toggled when the side navigation bar is visible */}
        <div
          className={`${styles.darkFilter} ${
            state.isSideBarToggled && styles.displayNav
          }`}
          onClick={() => {
            dispatch({ type: TOGGLE_SIDEBAR, value: false })
          }}
        />

        {/* Status popup */}
        <MessageIndicator
          state={state.indicatorState}
          className={styles.indicatorPos}
        />

        {/* Content */}
        <div className={styles.content}>
          {children}
        </div>
      </div>
    </NavContext.Provider>
  )
}
