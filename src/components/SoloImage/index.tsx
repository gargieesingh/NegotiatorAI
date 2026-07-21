import { useState } from "react";
import Image from "@/components/Image";
import ModalView from "@/components/ModalView";

const SoloImage = ({}) => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <div className="cursor-pointer bg-white-0 border border-stroke-soft-200 rounded-2xl p-1 overflow-hidden" onClick={() => setOpen(true)}>
                <Image
                    className="w-full rounded-xl object-cover"
                    src="/images/image-1.jpg"
                    width={731}
                    height={418}
                    alt=""
                />
            </div>
            <ModalView
                open={open}
                onClose={() => setOpen(false)}
                image="/images/image-1.jpg"
            />
        </>
    );
};

export default SoloImage;
