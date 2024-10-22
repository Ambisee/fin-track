import { cn } from "@/lib/utils"

export default function SettingsSection(props: {
	children?: JSX.Element
	className?: string
	name?: string
}) {
	return (
		<section className={cn("mt-8 mb-16 max-w-96", props.className)}>
			<h3 className="text-lg mb-4">{props.name}</h3>
			{props.children}
		</section>
	)
}
