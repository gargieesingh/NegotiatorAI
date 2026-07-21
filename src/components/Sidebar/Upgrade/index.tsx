import { useState } from "react";
import Image from "@/components/Image";
import Icon from "@/components/Icon";
import ModalPlan from "@/components/ModalPlan";

const Upgrade = ({}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="mt-8 max-md:mt-6">
                <div className="">
                    <Image
                        className="w-full opacity-100"
                        src="/images/upgrade-pic-light.png"
                        width={220}
                        height={140}
                        alt="Upgrade"
                        priority
                    />
                </div>
                <div className="p-3 rounded-b-xl border border-t-0 border-stroke-soft-200 bg-weak-50/50">
                    <div
                        className="group flex items-center gap-1 text-label-md cursor-pointer text-strong-950 font-medium"
                        onClick={() => setOpen(true)}
                    >
                        Upgrade to Premium{" "}
                        <Icon
                            className="fill-blue-500 transition-transform group-hover:translate-x-0.5"
                            name="arrow"
                        />
                    </div>
                    <div className="mt-0.75 text-label-xs text-sub-600">
                        Want to reach{" "}
                        <span className="text-strong-950 font-semibold">more features</span>{" "}
                        and grow much bigger?
                    </div>
                </div>
            </div>
            <ModalPlan open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default Upgrade;

