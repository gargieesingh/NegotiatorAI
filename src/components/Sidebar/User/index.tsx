import Link from "next/link";
import Image from "@/components/Image";
import Icon from "@/components/Icon";

const User = ({}) => (
    <Link
        className="group flex items-center shrink-0 gap-2 mx-5 pt-3 px-3 pb-5 border-t border-stroke-soft-200"
        href="/auth/sign-in"
    >
        <div className="">
            <Image
                className="size-10 rounded-full opacity-100"
                src="/images/avatar-1.png"
                width={40}
                height={40}
                alt="User"
            />
        </div>
        <div className="text-label-sm">
            <div className="">Emillia Caitin</div>
            <div className="text-sub-600">hey@agency.com</div>
        </div>
        <Icon
            className="ml-auto fill-sub-600 -rotate-90 transition-transform group-hover:translate-x-0.5"
            name="chevron"
        />
    </Link>
);

export default User;
