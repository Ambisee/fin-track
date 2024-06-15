"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { MouseEventHandler, Ref, useEffect, useRef, useState } from "react"

import NavTogglerButton from "../NavTogglerButton/NavTogglerButton"
import { sbClient } from "@/supabase/supabase_client";
import { useDashboardData } from "../DashboardDataProvider/DashboardDataProvider"

import styles from "./ProtectedHeader.module.css"
import useGlobalStore from "@/hooks/useGlobalStore"

interface ProtectedHeaderProps {
    title?: string,
    className?: string,
}

export default function ProtectedHeader(props: ProtectedHeaderProps) {
    const router = useRouter()
    const dropdownRef = useRef<HTMLDivElement | null>(null)
    const { user } = useDashboardData()

    const toggleNav = useGlobalStore(state => state.toggleNav)
    const toggleDropdown = useGlobalStore(state => state.toggleDropdown)
    const toggleBackdrop = useGlobalStore(state => state.toggleBackdrop)
    const addBackdropCallback = useGlobalStore(state => state.addBackdropCallback)
    const closeBackdrop = useGlobalStore(state => state.closeBackdrop)

    const isDropdownToggled = useGlobalStore((state) => state.isDropdownToggled)
    
    useEffect(() => {
        const handleOutsideClick = (e: MouseEvent) => {
            if (e.target === null) return

            if (!dropdownRef.current?.contains(e.target as Node)) {
                toggleDropdown(false);
            }
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isDropdownToggled) {
                toggleDropdown(false)
            }
        }
        
        document.addEventListener("keydown", handleKeyDown)
        document.addEventListener("mousedown", handleOutsideClick)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [isDropdownToggled, toggleDropdown])

    return (
        <header 
            className={`
                ${styles["header-element"]}
                ${isDropdownToggled && styles["show"]}
                ${props.className}
            `}
        >
            <NavTogglerButton 
                className={styles["nav-toggler-button"]}
                onClick={() => {
                    toggleNav(true)
                    toggleBackdrop(true)
                    addBackdropCallback(() => toggleNav(false))
                }}
            />
            <div 
                ref={dropdownRef}
                className={styles["profile-container"]}
                onClick={() => {
                    const value = !isDropdownToggled
                    toggleDropdown(value)
                }}
            >
                <span>{user?.user_metadata?.username || "No username"}</span>
                <div className={styles["profile-icon"]} />

                <div 
                    className={`
                        ${styles["profile-dropdown"]}
                        ${isDropdownToggled && styles["show"]}
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
                                        router.refresh()
                                        router.push("/")
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