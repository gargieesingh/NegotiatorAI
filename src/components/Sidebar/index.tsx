"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import Icon from "@/components/Icon";
import MyWorkspace from "./MyWorkspace";

type Props = {
    visible: boolean;
    onClose: () => void;
    onClickNewChat: () => void;
};

const navItems = [
    { href: "/", label: "Home", icon: "chat" as const },
    { href: "/negotiate", label: "Negotiation Results", icon: "history" as const },
    { href: "/report", label: "Reports", icon: "document" as const },
];

const Sidebar = ({ visible, onClose, onClickNewChat }: Props) => {
    const pathname = usePathname();

    return (
        <div
            className={`fixed top-5 left-5 bottom-5 flex flex-col w-80 bg-white-0 rounded-3xl shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] z-30 max-3xl:w-65 max-lg:top-0 max-lg:left-0 max-lg:bottom-0 max-lg:w-75 max-lg:rounded-none max-lg:transition-transform max-md:w-full max-md:p-4 ${
                visible ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"
            }`}
        >
            <div className="grow overflow-auto scrollbar-none p-5">
                {/* Brand */}
                <div className="flex items-center gap-2 mb-6 max-lg:pr-2 max-md:mb-3">
                    <MyWorkspace />
                    <button
                        className="group hidden ml-4 max-lg:flex"
                        onClick={onClose}
                    >
                        <Icon
                            className="text-label-sm fill-strong-950 transition-colors group-hover:fill-blue-500"
                            name="close"
                        />
                    </button>
                </div>

                {/* Primary CTA */}
                <Link
                    href="/"
                    onClick={onClickNewChat}
                    className="flex items-center justify-center gap-2 h-10 mb-5 px-4 rounded-xl bg-blue-600 text-white-0 text-label-sm font-semibold hover:bg-blue-700 transition-colors"
                >
                    <Sparkles className="size-4 text-white-0 fill-white-0" />
                    New Negotiation
                </Link>

                {/* Nav */}
                <div className="mb-2 text-label-xs text-soft-400 font-medium px-1">
                    Workflow
                </div>
                <nav className="space-y-0.5">
                    {navItems.map((item) => {
                        const active = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`group flex items-center gap-2.5 h-10 px-3 rounded-xl text-label-sm font-medium transition-colors ${
                                    active
                                        ? "bg-weak-50 text-strong-950"
                                        : "text-sub-600 hover:text-strong-950 hover:bg-weak-50"
                                }`}
                            >
                                <Icon
                                    className={`transition-colors ${
                                        active
                                            ? "fill-blue-500"
                                            : "fill-sub-600 group-hover:fill-strong-950"
                                    }`}
                                    name={item.icon}
                                />
                                {item.label}
                                {active && (
                                    <span className="ml-auto size-1.5 rounded-full bg-blue-500" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* AI Stack badge */}
                <div className="mt-auto pt-6">
                    <div className="rounded-2xl border border-stroke-soft-200 bg-weak-50 p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-soft-400 mb-2">
                            Powered by
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {["Codex", "ElevenLabs", "Google Places", "GPT-5.6"].map((name) => (
                                <span
                                    key={name}
                                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-white-0 border border-stroke-soft-200 text-[10px] font-semibold text-sub-600"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                        <p className="mt-3 text-[10px] text-soft-400">
                            Built for OpenAI Hackathon
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
