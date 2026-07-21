
type Props = {
    onOpenSidebar: () => void;
    onToggleTools: () => void;
};

const Header = ({ onOpenSidebar, onToggleTools }: Props) => {
    return (
            <div className="flex items-center justify-between mb-6 max-md:mb-4">
                <div className="flex items-center gap-3">
                    <Image className="size-9 opacity-100" src="/images/ai-voice.png" width={36} height={36} alt="The Negotiator" />
                    <div className="text-label-lg">The Negotiator</div>
                </div>
            </div>
    );
};

export default Header;
import Image from "@/components/Image";
