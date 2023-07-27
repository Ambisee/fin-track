import { Metadata } from "next"

import styles from "./page.module.css"
import ActionLink from "@/components/ActionLink/ActionLink"

export const metadata: Metadata = {
    title: "Home | FinTrack",
    description: `FinTrack is an application that allows user to record their spendings and earnings.`
}
  

export default function Home() {
    return (
        <main id={styles["main"]}>
            <div className={styles["hero-container"]}>
                <h1 className={styles["title-container"]}>
                    Take <br/>
                    <span className={styles["hero-title-colored-text"]}><u>personal finance</u>
                    </span> <br/>
                    into <br/>
                    <span><u>your own hands</u></span>
                </h1>
                <p className={styles["short-description-container"]}>
                    Financial management at
                    the tip of your fingers. Record
                    and track your daily income
                    and expenses with ease.
                </p>
                <div className={styles["action-links-container"]}>
                    <ActionLink href="/login">
                        Get started
                    </ActionLink>
                    <ActionLink id={styles["action-link-2"]} href="/about">
                        Learn more
                    </ActionLink>
                </div>
            </div>
        </main>
    )
}