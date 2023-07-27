import Link, { LinkProps } from "next/link";

import styles from "./ActionLink.module.css"

interface ActionLinkProps extends LinkProps {
    href: string,
    children?: React.ReactNode,
    className?: string,
    id?: string,
}

const ActionLink: React.FC<ActionLinkProps> = ({
    className,
    children,
    href,
    id,
    ...props
}) => {
    return (
        <Link href={href} id={id} className={`${className} ${styles["action-link"]}`}>
            {children}
        </Link>
    );
}
 
export default ActionLink;