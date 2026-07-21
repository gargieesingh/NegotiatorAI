"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Button from "@/components/Button";
import ModalPlan from "@/components/ModalPlan";
import Icon from "@/components/Icon";

type Props = {
    onOpenSidebar?: () => void;
};

const Header = ({ onOpenSidebar }: Props) => {
    const [open, setOpen] = useState(false);
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
        <>
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
                <div className="flex shrink-0 items-center gap-2">
                    {/* Navigation Pills */}
                    <nav className="hidden md:flex items-center gap-1.5 p-1 bg-weak-50 rounded-full border border-stroke-soft-200 text-xs font-medium mr-2">
                        {[
                            { label: "Intake", href: "/intake" },
                            { label: "Discovery", href: "/discover" },
                            { label: "Calls", href: "/calls" },
                            { label: "Negotiate", href: "/negotiate" },
                            { label: "Report", href: "/report" },
                        ].map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`px-3 py-1 rounded-full transition-all ${
                                        isActive
                                            ? "bg-white-0 text-strong-950 font-bold shadow-xs"
                                            : "text-sub-600 hover:text-strong-950 hover:bg-white-0/50"
                                    }`}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <Button
                        className="max-md:hidden"
                        icon="flash"
                        isBlack
                        onClick={() => setOpen(true)}
                    >
                        Upgrade
                    </Button>
                </div>
            </div>
            <ModalPlan open={open} onClose={() => setOpen(false)} />
        </>
    );
};

export default Header;
