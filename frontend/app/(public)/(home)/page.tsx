import { Metadata } from "next"

import styles from "./page.module.css"

export const metadata: Metadata = {
    title: "Home | FinTrack",
    description: `FinTrack is an application that allows user to record their spendings and earnings.`
}
  

export default function Home() {
    return (
        <main id={styles["main"]} className={styles["hero-container"]}>
            <h1>
                Take <br/>
                <span className={styles["hero-title-colored-text"]}>personal finance</span> <br/>
                into <br/>
                <span>your own hands</span>
            </h1>
            <p>
                Financial management at
                the tip of your fingers. Record
                and track your daily income
                and expenses with ease.
            </p>
            <div>
                
            </div>
        </main>
    )
}