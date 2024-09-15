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
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useCategoriesQuery } from "@/lib/hooks"
import { ArrowLeftIcon } from "@radix-ui/react-icons"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { ChevronLeft, PlusIcon, X } from "lucide-react"
import { useContext } from "react"
import { EntryFormContext, FormSchema } from "./EntryForm"
import { UseFormReturn } from "react-hook-form"

interface ChooseCategoryPageProps {
	form: UseFormReturn<FormSchema>
}

export default function ChooseCategoryPage(props: ChooseCategoryPageProps) {
	const categoriesQuery = useCategoriesQuery()
	const { setCurPage } = useContext(EntryFormContext)

	return (
		<div>
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">Choose a category</h1>
				</DialogTitle>
				<Button
					variant="ghost"
					className="absolute block left-0 top-1/2 translate-y-[-50%] rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					onClick={() => setCurPage(0)}
				>
					<ChevronLeft className="w-4 h-4" />
				</Button>
				<DialogClose asChild>
					<Button
						variant="ghost"
						className="absolute block right-0 top-1/2 translate-y-[-50%] rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
					>
						<X className="w-4 h-4" />
					</Button>
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>
						Choose the category that will be associated with the current entry
					</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div className="mt-8 sm:mt-4">
				<Command defaultValue={props.form.getValues("category.name")}>
					<div className="grid items-center grid-cols-[1fr_auto]">
						<CommandInput placeholder="Search for a category..." />
						<Button variant="ghost">
							<PlusIcon className="w-4 h-4" />
						</Button>
					</div>
					<CommandEmpty className="grid justify-center gap-2 py-4">
						<span className="text-center">No category found</span>
						<div className="flex gap-2">
							<Button>Create a category</Button>
							<Button variant="outline">Reset</Button>
						</div>
					</CommandEmpty>
					<CommandGroup>
						<CommandList>
							{categoriesQuery.data?.data?.map((val) => (
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
							))}
						</CommandList>
					</CommandGroup>
				</Command>
			</div>
		</div>
	)
}
