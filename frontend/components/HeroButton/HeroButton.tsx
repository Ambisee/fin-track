import Link, { LinkProps } from "next/link";

interface HeroButtonProps extends LinkProps {
    children: React.ReactNode,
    className: string
}

const HeroButton: React.FC<HeroButtonProps> = (props) => {
    const {
        className,
        children,
        href
    } = props
    
    return (
        <Link href={href} className={`${className}`}>
            {children}
        </Link>
    );
}
 
export default HeroButton;