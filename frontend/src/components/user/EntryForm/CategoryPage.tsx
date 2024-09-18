import { useForm, UseFormReturn } from "react-hook-form"
import { EntryFormContext, EntryFormItem, FormSchema } from "./EntryForm"
import {
	DialogClose,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from "@/components/ui/dialog"
import { useContext } from "react"
import { ChevronLeft, X } from "lucide-react"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface CategoryPageProps {
	form: UseFormReturn<FormSchema>
}

const formSchema = z.object({
	name: z.string()
})

export default function CategoryPage(props: CategoryPageProps) {
	const { setCurPage } = useContext(EntryFormContext)
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			name: ""
		}
	})

	return (
		<div className="grid grid-rows-[auto_1fr_auto]">
			<DialogHeader className="relative space-y-0 sm:text-center">
				<DialogTitle className="leading-6" asChild>
					<h1 className="h-6 leading-6">Create category</h1>
				</DialogTitle>
				<button
					className="absolute block left-0 top-1/2 translate-y-[-50%]"
					onClick={() => setCurPage(1)}
				>
					<ChevronLeft className="w-4 h-4" />
				</button>
				<DialogClose className="absolute block right-0 top-1/2 translate-y-[-50%]">
					<X className="w-4 h-4" />
				</DialogClose>
				<DialogDescription>
					<VisuallyHidden>Create a new category</VisuallyHidden>
				</DialogDescription>
			</DialogHeader>
			<div>
				<p className="text-sm text-muted-foreground mt-8">
					Enter the name of the new category. Please note that no two categories
					may share the same name.
				</p>
				<Form {...form}>
					<form>
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem className="mt-2">
									<FormControl>
										<Input placeholder="Enter a new category name" {...field} />
									</FormControl>
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</div>
			<DialogFooter>
				<Button>Create category</Button>
			</DialogFooter>
		</div>
	)
}
