import React from 'react'
import Head from "next/head"
import Image from "next/image"
import { useEffect, useReducer } from "react"

import { useAuth } from "../../firebase/auth"
import { useFirestore } from "../../firebase/firestore"
import { flashMessage } from "../../components/common/utils"
import DashboardActionButton from "../../components/dashboard_page/DashboardActionButton/DashboardActionButton"
import DashboardFormField from "../../components/dashboard_page/DashboardFormField/DashboardFormField"
import {
  reducer,
  reauthenticationHandlers,
  SET_ALLOW_EMAIL_REPORT,
  SET_DISPLAY_NAME,
  SET_EMAIL,
} from "./utils/account_utils"
import {
  INFO,
  ERROR,
} from "../../components/common/MessageIndicator/MessageIndicator"
import DashboardLayout, {
  useLayoutReducer,
} from "../../components/dashboard_page/DashboardLayout/DashboardLayout"

import styles from "./styles/account.module.css"

export default function DashboardAccountPage() {
  const auth = useAuth()
  const firestore = useFirestore()
  const { navDispatch } = useLayoutReducer()
  const [dataState, dataDispatch] = useReducer(reducer, {
    email: auth.user.email,
    displayName: auth.user.displayName,
    canSendReport: firestore?.profileData?.canSendReport || false
  })

  useEffect(() => {
    dataDispatch({type: SET_ALLOW_EMAIL_REPORT, value: firestore.profileData.canSendReport || false})
  }, [firestore.profileData.canSendReport])

  return (
    <div className={styles.dashboardAccount}>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_TITLE} | Dashboard | Account`}</title>
      </Head>
      <h3>Account Settings</h3>
      <div className={styles.profileContainer}>
        <div className={styles.pictureContainer}>
          <label>Profile picture</label>
          <div className={styles.editPicture}>
            <div className={styles.pictureDisplay}>
              {auth.user.photoURL && (
                <Image
                  className={styles.pictureDisplay}
                  src={auth.user.photoURL}
                  layout="fill"
                  alt="Error"
                />
              )}
            </div>
            <DashboardActionButton
              className={styles.editPictureButton}
              type="button"
            >
              Edit
            </DashboardActionButton>
          </div>
        </div>
        <div className={styles.infoContainer}>
          <DashboardFormField
            type="text"
            name="Username"
            value={dataState.displayName}
            onChange={(e) =>
              dataDispatch({ type: SET_DISPLAY_NAME, value: e.target.value })
            }
            withLabel={true}
            className={styles.infoFormField}
          ></DashboardFormField>
          <div className={styles.customField}>
            <DashboardFormField
              type="text"
              name="Email"
              value={dataState.email}
              disabled={true}
              onChange={(e) =>
                dataDispatch({ type: SET_EMAIL, value: e.target.value })
              }
              withLabel={true}
              className={styles.infoFormField}
            ></DashboardFormField>
            <div
              style={{ display: "flex", gap: "0.5rem", fontSize: "0.75rem" }}
            >
              <input
                id="sendReportFlag"
                type="checkbox"
                disabled={dataState?.canSendReport === undefined}
                checked={dataState.canSendReport}
                onChange={(e) => {
                    dataDispatch({
                        type: SET_ALLOW_EMAIL_REPORT,
                        value: !(dataState.canSendReport),
                    })
                }}
              />
              <label htmlFor="sendReportFlag">
                Allow email report to be sent to this email address
              </label>
            </div>
          </div>
          <div className={styles.customField}>
            <label>Password</label>
            <DashboardActionButton
              onClick={() => {
                if (
                  !confirm(
                    "If this account is logged in through Google, resetting the password will allow for login with email and password. \n\nAre you sure you would like to continue?"
                  )
                ) {
                  return
                }
                auth.resetPassword(
                  auth.user.email,
                  () =>
                    flashMessage(
                      navDispatch,
                      "Success, check your email to reset your password",
                      INFO,
                      2000
                    ),
                  (error) =>
                    flashMessage(
                      navDispatch,
                      `An error occured: ${error.message}`,
                      ERROR,
                      2000
                    )
                )
              }}
              style={{ color: "white", background: "rgba(67, 85, 255, 0.65)" }}
            >
              Send password reset email
            </DashboardActionButton>
          </div>
          <div>
            <DashboardActionButton
              onClick={() => {
                auth.setUserProfile(
                  dataState.displayName, 
                  undefined, 
                  (success) => flashMessage(navDispatch, success.message, INFO, 2000)
                )
              }}
            >
              Apply changes
            </DashboardActionButton>
          </div>
        </div>
      </div>
    </div>
  )
}

DashboardAccountPage.getLayout = function getLayout(page) {
  return <DashboardLayout pageIndex={1}>{page}</DashboardLayout>
}
