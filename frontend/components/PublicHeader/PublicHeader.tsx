import Image from "next/image"
import Link from "next/link"

import styles from "./PublicHeader.module.css"
import ThemeSwitchButton from "../ThemeSwitchButton/ThemeSwitchButton";

interface PublicHeaderProps {}

export const PublicHeader: React.FC<PublicHeaderProps> = ({

}) => {
    return (
        <header id={styles["header"]}>
            <Link href="/" className={styles["app-title-container"]}>
                <div className={styles["dummy-app-icon"]}></div> {/* Replace with app image later */}
                <h4 className={styles["app-title"]}>FinTrack</h4>
            </Link>
            <div 
                className={`
                    ${styles["clickables-container"]}
                `}
            >
                <ThemeSwitchButton />
                <nav>
                    <ul className={styles["page-links-container"]}>
                        <li className={styles["page-link"]}>
                            <Link href="/login">
                                Login
                            </Link>
                        </li>
                        <li 
                            className={`
                                ${styles["page-link"]} 
                                ${styles["register-link"]}
                            `}
                        >
                            <Link href="/register">
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
 
export default PublicHeader;