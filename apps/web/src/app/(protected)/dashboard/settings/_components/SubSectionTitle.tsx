/** A component for rendering a non-<label> title for a settings subsection */
export default function SubSectionTitle(props: { children: string }) {
	return (
		<h6 className="mb-3 text-sm font-medium leading-none">{props.children}</h6>
	)
}
