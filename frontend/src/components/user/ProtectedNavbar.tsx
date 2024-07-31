"use client"

import { FileIcon, GearIcon, HomeIcon, TableIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import EntryForm from "./EntryForm"
import { Button } from "../ui/button"
import { PlusIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Drawer, DrawerTrigger } from "@/components/ui/drawer"
import { useMediaQuery } from "react-responsive"
import { DESKTOP_BREAKPOINT } from "@/lib/constants"
import { Dialog, DialogTrigger } from "../ui/dialog"

function NavLink(props: { href: string; icon?: JSX.Element; label: string }) {
	return (
		<li>
			<Button variant="ghost" className="p-0 w-full md:block">
				<Link
					href={props.href}
					className="grid grid-flow-row justify-items-center gap-1
                    md:flex md:gap-8"
				>
					{props.icon}
					<span className="text-xs md:text-base">{props.label}</span>
				</Link>
			</Button>
		</li>
	)
}

function PopoverTrigger(props: { children: JSX.Element }) {
	const isDesktop = useMediaQuery({
		minWidth: DESKTOP_BREAKPOINT
	})

	if (isDesktop) {
		return <DialogTrigger asChild>{props.children}</DialogTrigger>
	}

	return <DrawerTrigger asChild>{props.children}</DrawerTrigger>
}

function PopoverRoot(props: { children: JSX.Element }) {
	const isDesktop = useMediaQuery({
		minWidth: DESKTOP_BREAKPOINT
	})

	if (isDesktop) {
		return <Dialog>{props.children}</Dialog>
	}

	return (
		<Drawer
			shouldScaleBackground
			disablePreventScroll={true}
			setBackgroundColorOnScale={false}
		>
			{props.children}
		</Drawer>
	)
}

export default function ProtectedNavbar() {
	const queryClient = useQueryClient()

	return (
		<PopoverRoot>
			<>
				<div className="dashboard-navbar">
					<h1 className="hidden text-xl p-4 pb-8 font-bold md:block md:text-center">
						FinTrack
					</h1>
					<nav className="w-full">
						<ul className="list-none flex justify-between items-center w-full md:grid md:justify-center md:gap-2">
							<NavLink
								href="/dashboard"
								icon={<HomeIcon width={24} height={24} />}
								label="Home"
							/>
							<NavLink
								href="/dashboard/entries"
								icon={<TableIcon width={24} height={24} />}
								label="Entries"
							/>
							<li className="relative w-8 md:absolute md:w-full md:bottom-0 md:left-0">
								<PopoverTrigger>
									<Button
										variant="default"
										className="absolute left-1/2 translate-x-[-50%] top-[-2.75rem] rounded-full aspect-square w-10 h-10 p-0
                                        md:bottom-8 md:top-auto md:left-1/2"
									>
										<PlusIcon width={24} height={24} />
									</Button>
								</PopoverTrigger>
							</li>
							<NavLink
								href="/dashboard/reports"
								icon={<FileIcon width={24} height={24} />}
								label="Report"
							/>
							<NavLink
								href="/dashboard/settings"
								icon={<GearIcon width={24} height={24} />}
								label="Settings"
							/>
						</ul>
					</nav>
				</div>
				<EntryForm
					onSubmitSuccess={(data) => {
						queryClient.invalidateQueries({ queryKey: ["entryData"] })
					}}
				/>
			</>
		</PopoverRoot>
	)
}
