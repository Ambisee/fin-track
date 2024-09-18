import { Button } from "@/components/ui/button"
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from "@/components/ui/command"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useCategoriesQuery } from "@/lib/hooks"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { CheckIcon, ChevronLeft, PlusIcon, X } from "lucide-react"
import { useContext, useEffect } from "react"
import { EntryFormContext, FormSchema } from "./EntryForm"
import { UseFormReturn } from "react-hook-form"

interface ChooseCategoryPageProps {
	form: UseFormReturn<FormSchema>
}

export default function ChooseCategoryPage(props: ChooseCategoryPageProps) {
	const categoriesQuery = useCategoriesQuery()
	const { setCurPage } = useContext(EntryFormContext)

	useEffect(() => {
		const cmdkInputWrapper = document.querySelector("[cmdk-input-wrapper]")
		if (cmdkInputWrapper === null) return

		cmdkInputWrapper.classList.remove("border-b")
	}, [])

	return (
		<div className="relative h-full grid grid-rows-[auto_1fr] gap-4 sm:gap-8">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">Choose a category</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage(0)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						Choose the category that will be associated with the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="w-full h-full">
				<Command
					className="rounded-lg border shadow-md"
					defaultValue={props.form.getValues("category.name")}
				>
					<div className="grid items-center grid-cols-[1fr_auto] border-b">
						<CommandInput
							className="border-none"
							placeholder="Search for a category..."
						/>
						<button className="h-full aspect-square flex focus:bg-transparent">
							<PlusIcon className="w-4 h-4 m-auto" />
						</button>
					</div>
					<CommandEmpty className="grid justify-center gap-2 py-4">
						<span className="text-center">No category found</span>
						<div className="flex gap-2">
							<Button>Create a category</Button>
							<Button variant="outline">Reset</Button>
						</div>
					</CommandEmpty>
					<CommandGroup heading="Current">
						<CommandItem
							key={props.form.getValues("category.name")}
							value={props.form.getValues("category.name")}
							onSelect={(e) => {
								setCurPage(0)
							}}
						>
							<span>{props.form.getValues("category.name")}</span>
							<CheckIcon className="w-4 h-4 ml-2" />
						</CommandItem>
					</CommandGroup>
					<CommandSeparator />
					<CommandGroup heading="Other">
						<CommandList>
							{categoriesQuery.data?.data?.map((val) =>
								props.form.getValues("category.id") !== val.id ? (
									<CommandItem
										key={val.name}
										value={val.name}
										onSelect={(e) => {
											props.form.setValue("category", {
												id: val.id,
												name: val.name
											})
											setCurPage(0)
										}}
									>
										<span>{val.name}</span>
									</CommandItem>
								) : undefined
							)}
						</CommandList>
					</CommandGroup>
				</Command>
			</div>
		</div>
	)
}
