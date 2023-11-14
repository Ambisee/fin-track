"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MouseEventHandler, Ref, useEffect, useRef, useState } from "react"

import NavTogglerButton from "../NavTogglerButton/NavTogglerButton"
import { sbClient } from "@/supabase/supabase_client";

import styles from "./ProtectedHeader.module.css"
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

interface ProtectedHeaderProps {
    title?: string,
    isDropdownVisible: boolean,
    navTogglerCallback: MouseEventHandler<HTMLButtonElement>,
    dropdownTogglerCallback: MouseEventHandler<HTMLDivElement>,
    dropdownTogglerRef: Ref<HTMLDivElement>,
    className?: string,
    togglerClassName?: string,
}

export default function ProtectedHeader(props: ProtectedHeaderProps) {
    const router = useRouter()
    const { user } = useDashboardData()
    
    return (
        <header 
            className={`
                ${styles["header-element"]}
                ${props.className}
            `}
        >
            <NavTogglerButton 
                className={`
                    ${styles["nav-toggler-button"]}
                    ${props.togglerClassName}
                `}
                onClick={props.navTogglerCallback} 
            />
            <h4>
                Home
            </h4>
            <div 
                ref={props.dropdownTogglerRef}
                className={styles["profile-container"]}
                onClick={props.dropdownTogglerCallback}
            >
                <span>{user?.user_metadata?.username || "No username"}</span>
                <div className={styles["profile-icon"]} />

                <div 
                    className={`
                        ${styles["profile-dropdown"]}
                        ${props.isDropdownVisible && styles["show"]}
                    `}
                >
                    <ul className={styles["profile-dropdown-list"]}>
                        <li>
                            <Link 
                                href="/dashboard/settings"
                                className={styles["profile-dropdown-link"]}
                            >
                                Settings
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="#" 
                                className={styles["profile-dropdown-link"]}
                                onClick={() => {
                                    sbClient.auth.signOut().then(() => {
                                        router.push("/");
                                    })
                                }}
                            >
                                Logout
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    )
}