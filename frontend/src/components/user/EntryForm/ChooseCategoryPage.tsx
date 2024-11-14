import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from "@/components/ui/command"
import {
	DialogClose,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useCategoriesQuery } from "@/lib/hooks"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, PencilIcon, X } from "lucide-react"
import { useFormContext } from "react-hook-form"
import { FormSchema } from "./EntryForm"
import { useFormDialog } from "./FormDialogProvider"
import { useDialogPages } from "../DialogPagesProvider"

interface ChooseCategoryPageProps {
	showBackButton?: boolean
}

export default function ChooseCategoryPage(props: ChooseCategoryPageProps) {
	const form = useFormContext<FormSchema>()
	const categoriesQuery = useCategoriesQuery()
	const { setCurPage } = useDialogPages()

	const showBackButton = props.showBackButton ?? true

	return (
		<div className="max-h-full relative grid grid-rows-[auto_1fr] gap-4">
			<DialogHeader className="relative space-y-0 sm:text-center h-fit">
				<div className="relative">
					<DialogTitle className="leading-6" asChild>
						<h1 className="h-6 leading-6">Choose a category</h1>
					</DialogTitle>
					{showBackButton && (
						<button
							className="absolute block left-0 top-1/2 translate-y-[-50%]"
							onClick={() => setCurPage((c) => c - 1)}
						>
							<ChevronLeft className="w-4 h-4" />
						</button>
					)}
					<div className="absolute flex items-center gap-6 right-0 top-1/2 translate-y-[-50%]">
						<button
							className="h-full aspect-square"
							onClick={() => {
								setCurPage((c) => c + 1)
							}}
						>
							<PencilIcon className="w-4 h-4 m-auto" />
						</button>
						<DialogClose>
							<X className="w-4 h-4" />
						</DialogClose>
					</div>
				</div>
				<DialogDescription>
					<VisuallyHidden>
						Choose the category that will be associated with the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<Command
				className="h-full w-full gap-4 rounded-none"
				defaultValue={form.getValues("category")}
			>
				<div className="grid grid-cols-[1fr_auto] border rounded-md cmdk-input-no-border ">
					<CommandInput
						className="text-base"
						placeholder="Search for a category..."
					/>
				</div>
				<CommandEmpty className="flex flex-col h-full items-center gap-2 py-4">
					<span className="text-center">No category found</span>
					<div className="flex gap-2">
						<Button>Create a category</Button>
						<Button variant="outline">Reset</Button>
					</div>
				</CommandEmpty>
				<CommandList className="max-h-none overflow-y-auto flex-1 px-1">
					<CommandGroup className="*:grid *:gap-2 *:grid-cols-[repeat(auto-fill,minmax(125px,1fr))] *:grid-flow-row *:auto-rows-[150px]">
						{categoriesQuery.data?.data?.map((val) => (
							<CommandItem
								className="border rounded-md break-words cursor-pointer"
								key={val.name}
								value={val.name}
								onSelect={(e) => {
									form.setValue("category", val.name)
									setCurPage(0)
								}}
							>
								<p className="w-full text-sm text-center">{val.name}</p>
							</CommandItem>
						))}
					</CommandGroup>
				</CommandList>
			</Command>
		</div>
	)
}
