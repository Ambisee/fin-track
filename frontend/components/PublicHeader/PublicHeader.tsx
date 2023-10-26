import Image from "next/image"
import Link from "next/link"

import styles from "./PublicHeader.module.css"
import ThemeSwitchButton from "../ThemeSwitchButton/ThemeSwitchButton";
import { LOGIN_PAGE_URL, REGISTRATION_PAGE_URL } from "@/helpers/url_routes";

interface PublicHeaderProps {
    className?: string
}

export default function PublicHeader({
    className,
}: PublicHeaderProps) {
    return (
        <header id={styles["header"]} className={className}>
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
                            <Link href={LOGIN_PAGE_URL}>
                                Login
                            </Link>
                        </li>
                        <li 
                            className={`
                                ${styles["page-link"]} 
                                ${styles["register-link"]}
                            `}
                        >
                            <Link href={REGISTRATION_PAGE_URL}>
                                Sign Up
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
