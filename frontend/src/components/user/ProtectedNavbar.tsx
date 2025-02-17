"use client"

import { ENTRY_QKEY } from "@/lib/constants"
import { useSettingsQuery } from "@/lib/hooks"
import useGlobalStore from "@/lib/store"
import { cn } from "@/lib/utils"
import { GearIcon, TableIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"
import { BarChart3Icon, HouseIcon, PlusIcon } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button, buttonVariants } from "../ui/button"
import { DialogTrigger } from "../ui/dialog"

function NavLink(props: { href: string; icon?: JSX.Element; label: string }) {
	const pathname = usePathname()

	return (
		<li className="w-1/5 md:w-full">
			<Link prefetch href={props.href} className="w-full h-full md:block">
				<div
					className={cn(
						buttonVariants({
							variant: pathname === props.href ? "default" : "ghost"
						}),
						"p-2 w-fit h-fit mx-auto grid grid-flow-row justify-items-center md:w-full md:flex md:justify-start md:gap-4 md:px-4 md:py-2"
					)}
				>
					{props.icon}
					{/* <span className="text-xs md:text-base"> */}
					<span className="hidden text-xs md:inline md:text-base">
						{props.label}
					</span>
				</div>
			</Link>
		</li>
	)
}

export default function ProtectedNavbar() {
	const pathname = usePathname()
	const queryClient = useQueryClient()

	const settingsQuery = useSettingsQuery()

	const setOpen = useGlobalStore((state) => state.setOpen)
	const setData = useGlobalStore((state) => state.setData)
	const setOnSubmitSuccess = useGlobalStore((state) => state.setOnSubmitSuccess)

	return (
		<>
			<div className="dashboard-navbar">
				<h1 className="hidden text-xl p-4 pb-8 font-bold md:block md:text-center">
					FinTrack
				</h1>
				<nav className="w-full h-full md:h-auto">
					<ul className="w-full h-full list-none flex justify-between items-center md:grid md:justify-center md:gap-1">
						<NavLink
							href="/dashboard"
							icon={<HouseIcon className="block" width={20} height={20} />}
							label="Home"
						/>
						<NavLink
							href="/dashboard/entries"
							icon={<TableIcon className="block" width={20} height={20} />}
							label="Entries"
						/>
						<li className="relative w-8 md:absolute md:w-full md:bottom-0 md:left-0">
							<DialogTrigger asChild>
								<Button
									variant="default"
									onClick={() => {
										setData(undefined)
										setOnSubmitSuccess((data) => {
											if (
												data.ledger !== settingsQuery.data?.data?.current_ledger
											) {
												return
											}

											queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
										})
										setOpen(true)
									}}
									className="absolute left-1/2 translate-x-[-50%] top-[-3.25rem] rounded-full aspect-square w-12 h-12 p-0
                                        md:bottom-8 md:top-auto md:left-1/2"
								>
									<PlusIcon className="block" width={30} height={30} />
								</Button>
							</DialogTrigger>
						</li>
						<NavLink
							href="/dashboard/statistics"
							icon={<BarChart3Icon className="block" width={20} height={20} />}
							label="Statistics"
						/>
						<NavLink
							href="/dashboard/settings"
							icon={<GearIcon className="block" width={20} height={20} />}
							label="Settings"
						/>
					</ul>
				</nav>
			</div>
		</>
	)
}
