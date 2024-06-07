import Link, { LinkProps } from "next/link";

import styles from "./ActionLink.module.css"

interface ActionLinkProps extends LinkProps {
    href: string,
    children?: React.ReactNode,
    className?: string,
    id?: string,
}

export default function ActionLink({
    className,
    children,
    href,
    id,
    ...props
}: ActionLinkProps) {
    return (
        <Link href={href} id={id} className={`${styles["action-link"]} ${className}`}>
            {children}
        </Link>
    );
}
