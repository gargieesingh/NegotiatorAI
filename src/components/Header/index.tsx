"use client";

import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

type Props = {
    onOpenSidebar?: () => void;
};

const Header = ({ onOpenSidebar }: Props) => {
    const pathname = usePathname();

    const getPageMeta = () => {
        switch (pathname) {
            case "/intake":
                return { title: "Scope Brief & Intake", subtitle: "Formulate job requirements and upload existing quotes" };
            case "/discover":
                return { title: "Market Discovery", subtitle: "Identify rated local service providers via Google Places" };
            case "/calls":
                return { title: "Live Outbound AI Calls", subtitle: "Conversational AI agents calling vendors for itemized quotes" };
            case "/negotiate":
                return { title: "Leverage Strategy & Negotiation", subtitle: "Analyze quotes and formulate optimal negotiation leverage" };
            case "/report":
                return { title: "Executive Quote Report", subtitle: "Audit report with price benchmarks and recommendations" };
            case "/agent-run":
                return { title: "Autonomous Agent Simulator", subtitle: "End-to-end automated AI procurement execution stream" };
            default:
                return { title: "Negotiator AI", subtitle: "AI-powered procurement and price negotiation agent" };
        }
    };

    const meta = getPageMeta();

    return (
        <div className="flex items-center gap-4 mb-3.5 max-md:gap-2 max-md:mb-3">
            <button
                className="hidden size-10 mr-2 justify-center items-center max-lg:flex max-md:mr-0"
                onClick={onOpenSidebar}
            >
                <Icon className="!size-6 fill-strong-950" name="burger" />
            </button>
            <div className="grow">
                <div className="text-label-xl font-bold text-strong-950 max-md:text-label-md">
                    {meta.title}
                </div>
                <div className="mt-0.5 line-clamp-1 text-label-md text-sub-600 max-lg:hidden">
                    {meta.subtitle}
                </div>
            </div>
        </div>
    );
};

export default Header;
