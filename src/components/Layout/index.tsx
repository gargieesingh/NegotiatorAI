"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    const [visibleSidebar, setVisibleSidebar] = useState(false);

    return (
        <div className="pl-80 overflow-hidden transition-all max-3xl:pl-65 max-lg:pl-0">
            <Sidebar
                visible={visibleSidebar}
                onClose={() => setVisibleSidebar(false)}
                onClickNewChat={() => {}}
            />
            <div className="pt-6 pb-6 px-8 max-2xl:pt-5 max-md:pt-3 max-md:px-4">
                <Header onOpenSidebar={() => setVisibleSidebar(true)} />
                <main className="mt-4">{children}</main>
            </div>
            {visibleSidebar && (
                <div
                    className="fixed inset-0 z-10 hidden bg-overlay backdrop-blur-sm transition-all max-lg:block"
                    onClick={() => setVisibleSidebar(false)}
                />
            )}
        </div>
    );
};

export default Layout;
