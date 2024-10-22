import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export default function InputSkeleton(props: { className?: string }) {
	return <Skeleton className={cn("h-10 w-full", props.className)} />
}
