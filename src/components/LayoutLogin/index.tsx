import Link from "next/link";
import Image from "@/components/Image";
import Button from "@/components/Button";
import Icon from "@/components/Icon";
import Slider from "./Slider";

type Props = {
    children: React.ReactNode;
    title: string;
    description: React.ReactNode;
};

const LayoutLogin = ({ title, description, children }: Props) => (
    <div className="p-5">
        <div className="flex min-h-[calc(100svh-2.5rem)]">
            <div className="relative w-1/2 text-static-white overflow-hidden max-lg:hidden">
                <Image
                    className="object-cover rounded-3xl"
                    src="/images/auth-pic.jpg"
                    fill
                    sizes="(max-width: 1023px) 100vw, 50vw"
                    alt=""
                />
                <div className="absolute top-19 left-10 right-10 max-2xl:top-8 max-2xl:left-8 max-2xl:right-8">
                    <div className="mb-4 text-h1 max-2xl:text-h3">
                        AI Generative Anything you can imagine
                    </div>
                    <div className="text-p-lg max-2xl:text-p-md">
                        Generate your ideas in to reality fast & quick !
                    </div>
                </div>
                <Slider />
            </div>
            <div className="flex flex-col w-1/2 pl-12 max-lg:w-full max-lg:pl-0">
                <div className="flex justify-between items-center mb-auto">
                    <div className="">
                        <div className="text-[1.125rem] font-bold">Website</div>
                        <div className="-mt-1 text-soft-400">
                            Visite Our website
                        </div>
                    </div>
                    <Button
                        className="!h-10 !gap-3 bg-white-0 rounded-xl"
                        isStroke
                    >
                        LoopiBot.com
                        <Icon className="!size-4.5" name="chevron-circle" />
                    </Button>
                </div>
                <div className="w-full max-w-89 mx-auto my-6">
                    <div className="mb-7 text-center max-md:mb-4">
                        <Link className="inline-flex mb-6 max-md:mb-4" href="/">
                            <Image
                                className="w-18 opacity-100 max-md:w-14"
                                src="/images/logo-auth.svg"
                                width={68}
                                height={68}
                                alt=""
                            />
                        </Link>
                        <div className="text-h3 max-md:text-[1.6rem]">
                            {title}
                        </div>
                        <div className="mt-1.5 text-h6 max-md:text-label-md">
                            {description}
                        </div>
                    </div>
                    {children}
                </div>
                <div className="flex justify-between items-center h-15 mt-auto max-2xl:h-auto">
                    <div className="text-label-sm text-sub-600">
                        ©LoopiBot.io
                    </div>
                    <button className="group flex items-center gap-2 text-label-sm text-sub-600 transition-colors hover:text-strong-950">
                        <Icon
                            className="!size-4.5 fill-sub-600 transition-colors group-hover:fill-strong-950"
                            name="envelope"
                        />
                        LoopiBot@chat.io
                    </button>
                </div>
            </div>
        </div>
    </div>
);

export default LayoutLogin;
