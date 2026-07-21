import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

type Props = {
    href: string;
    title: string;
    icon: string;
};

const NavLink = ({ href, title, icon }: Props) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            className={`group relative flex items-center shrink-0 gap-2 h-10 px-3 text-label-sm font-medium transition-colors hover:text-strong-950 not-last:mb-1 ${
                isActive ? "!text-blue-500 font-semibold" : "text-sub-600"
            }`}
            href={href}
        >
            <Icon
                className={`transition-colors group-hover:fill-strong-950 ${
                    isActive ? "!fill-blue-500" : "fill-sub-600"
                }`}
                name={icon}
            />
            <div>{title}</div>
        </Link>
    );
};

export default NavLink;
