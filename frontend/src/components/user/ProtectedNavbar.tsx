"use client"

import { FileIcon, GearIcon, HomeIcon, TableIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import EntryForm from "./EntryForm"
import { Button, buttonVariants } from "../ui/button"
import { PlusIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { ENTRY_QKEY } from "@/lib/constants"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

function NavLink(props: { href: string; icon?: JSX.Element; label: string }) {
	const pathname = usePathname()

	return (
		<li>
			<Link href={props.href} className="w-full md:block">
				<div
					className={cn(
						buttonVariants({
							variant: pathname === props.href ? "default" : "ghost"
						}),
						"p-2 w-14 h-fit grid grid-flow-row justify-items-center md:w-full md:flex md:justify-start md:gap-4 md:px-4 md:py-2"
					)}
				>
					{props.icon}
					<span className="text-xs md:text-base">{props.label}</span>
				</div>
			</Link>
		</li>
	)
}

function PopoverTrigger(props: { children: JSX.Element }) {
	return <DialogTrigger asChild>{props.children}</DialogTrigger>
}

function PopoverRoot(props: { children: JSX.Element }) {
	return <Dialog>{props.children}</Dialog>
}

export default function ProtectedNavbar() {
	const queryClient = useQueryClient()
	const pathname = usePathname()

	return (
		<PopoverRoot>
			<>
				<div className="dashboard-navbar">
					<h1 className="hidden text-xl p-4 pb-8 font-bold md:block md:text-center">
						FinTrack
					</h1>
					<nav className="w-full">
						<ul className="list-none flex justify-between items-center w-full md:grid md:justify-center md:gap-1">
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
										className="absolute left-1/2 translate-x-[-50%] top-[-3.25rem] rounded-full aspect-square w-12 h-12 p-0
                                        md:bottom-8 md:top-auto md:left-1/2"
									>
										<PlusIcon width={30} height={30} />
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
						queryClient.invalidateQueries({ queryKey: ENTRY_QKEY })
					}}
				/>
			</>
		</PopoverRoot>
	)
}
