"use client"

import { FileIcon, GearIcon, HomeIcon, TableIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import EntryForm from "./EntryForm"
import { Button } from "../ui/button"
import { PlusIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { Drawer, DrawerTrigger } from "@/components/ui/drawer"

function NavLink(props: { href: string; icon?: JSX.Element; label: string }) {
	return (
		<li>
			<Button
				variant="ghost"
				className="p-0 w-full md:block md:my-2 md:first:mt-0 md:last:mb-0 md:p-2"
			>
				<Link
					href={props.href}
					className="grid grid-flow-row justify-items-center gap-1
                    md:flex md:gap-4"
				>
					{props.icon}
					<span className="text-xs md:text-base">{props.label}</span>
				</Link>
			</Button>
		</li>
	)
}

export default function ProtectedNavbar() {
	const queryClient = useQueryClient()

	return (
		<Drawer
			shouldScaleBackground
			disablePreventScroll={true}
			setBackgroundColorOnScale={false}
		>
			<div
				className="w-full fixed bottom-0 left-0
                    h-16 px-6 bg-secondary text-secondary-foreground flex items-center
                    md:w-3/12 md:fixed md:left-0 md:top-0 md:h-screen md:block md:py-4 md:items-start"
			>
				<h1 className="hidden text-xl p-4 pb-8 font-bold md:block md:text-center">
					FinTrack
				</h1>
				<nav className="w-full">
					<ul className="list-none flex justify-between items-center w-full md:block">
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
						<div className="relative w-8 md:hidden">
							<DrawerTrigger asChild>
								<Button
									variant="default"
									className="absolute left-1/2 translate-x-[-50%] top-[-2.75rem] rounded-full aspect-square w-10 h-10 p-0"
								>
									<PlusIcon width={24} height={24} />
								</Button>
							</DrawerTrigger>
						</div>
						<NavLink
							href="/dashboard/reports"
							icon={<FileIcon width={24} height={24} />}
							label="Report"
						/>
						<NavLink
							href="dashboard/settings"
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
		</Drawer>
	)
}
