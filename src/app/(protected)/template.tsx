"use client"

import { cn } from "@/lib/utils"

interface ProtectedTemplateProps {
	children: JSX.Element
}

export default function ProtectedTemplate(props: ProtectedTemplateProps) {
	return <div className={cn("p-8 pb-16")}>{props.children}</div>
}
