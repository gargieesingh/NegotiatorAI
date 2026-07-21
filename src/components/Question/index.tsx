import Image from "@/components/Image";

type Props = {
    children: React.ReactNode;
};

const Question = ({ children }: Props) => (
    <div className="flex">
        <div className="shrink-0">
            <Image
                className="size-9 opacity-100 rounded-full object-cover"
                src="/images/avatar-2.png"
                width={36}
                height={36}
                alt="Avatar"
            />
        </div>
        <div className="w-[calc(100%-2.25rem)] pl-3">
            <div className="flex items-center gap-2 mb-1.5">
                <div className="text-label-sm text-strong-950 font-medium">James Brown</div>
                <div className="-mb-0.75 text-p-xs text-sub-600">1min ago</div>
            </div>
            <div className="p-4 bg-weak-50 border border-stroke-soft-200 rounded-2xl text-strong-950 text-p-md shadow-xs">
                {children}
            </div>
        </div>
    </div>
);

export default Question;
