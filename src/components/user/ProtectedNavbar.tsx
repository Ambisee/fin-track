"use client"

import {
	NavigationMenu,
	NavigationMenuItem,
	NavigationMenuList
} from "../ui/navigation-menu"
import { FileIcon, GearIcon, HomeIcon, TableIcon } from "@radix-ui/react-icons"
import Link from "next/link"
import { Button } from "../ui/button"
import { PlusIcon } from "lucide-react"
import { Drawer, DrawerTrigger } from "@/components/ui/drawer"
import { DrawerEntryForm } from "./EntryForm"
import { useQueryClient } from "@tanstack/react-query"

function MobileNavbar() {
	const queryClient = useQueryClient()

	return (
		<Drawer shouldScaleBackground setBackgroundColorOnScale={false}>
			<div>
				<div
					className="w-full fixed bottom-0 flex left-0
                    justify-between h-16 px-6 bg-secondary text-secondary-foreground
                    items-center md:hidden"
				>
					<Button variant="ghost" className="p-0 w-8">
						<Link
							href="/dashboard"
							className="grid grid-flow-row justify-items-center gap-1"
						>
							<HomeIcon width={24} height={24} />
							<span className="text-xs">Home</span>
						</Link>
					</Button>
					<Button variant="ghost" className="p-0 w-8">
						<Link
							href="/dashboard/entries"
							className="grid grid-flow-row justify-items-center gap-1"
						>
							<TableIcon width={24} height={24} />
							<span className="text-xs">Entries</span>
						</Link>
					</Button>
					<div className="relative w-8">
						<DrawerTrigger asChild>
							<Button
								variant="default"
								className="absolute left-1/2 translate-x-[-50%] top-[-2.75rem] rounded-full aspect-square w-10 h-10 p-0"
							>
								<PlusIcon width={24} height={24} />
							</Button>
						</DrawerTrigger>
					</div>
					<Button variant="ghost" className="p-0 w-8">
						<Link
							href="/dashboard/analytics"
							className="grid grid-flow-row justify-items-center gap-1"
						>
							<FileIcon width={24} height={24} />
							<span className="text-xs">Report</span>
						</Link>
					</Button>
					<Button variant="ghost" className="p-0 w-8">
						<Link
							href="/dashboard/settings"
							className="grid grid-flow-row justify-items-center gap-1"
						>
							<GearIcon width={24} height={24} />
							<span className="text-xs">Settings</span>
						</Link>
					</Button>
				</div>
			</div>
			<DrawerEntryForm
				onSubmitSuccess={(data) => {
					queryClient.invalidateQueries({ queryKey: ["entryData"] })
				}}
			/>
		</Drawer>
	)
}

function DesktopNavbar() {
	return <div className="hidden md:block">Navbar</div>
}

export default function ProtectedNavbar() {
	return (
		<>
			<DesktopNavbar />
			<MobileNavbar />
		</>
	)
}
