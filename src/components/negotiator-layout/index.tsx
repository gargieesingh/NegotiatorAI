import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Tools from "@/components/Tools";
import Header from "@/components/Header";
import PythonRunner from "@/components/PythonRunner";
import Calculator from "@/components/Calculator";
import Browser from "@/components/Browser";
import WebDesign from "@/components/WebDesign";
import FileConverter from "@/components/FileConverter";
import LanguageTranslator from "@/components/LanguageTranslator";
import ApiIntegrator from "@/components/ApiIntegrator";

type Props = {
    children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [visibleTools, setVisibleTools] = useState(true);
    const [visibleSidebar, setVisibleSidebar] = useState(false);

    return (
        <div
            className={`pl-90 overflow-hidden transition-all max-3xl:pl-75 max-lg:pl-5 max-md:pl-4 ${
                visibleTools
                    ? "pr-90 max-3xl:pr-75 max-2xl:pr-5 max-md:pr-4"
                    : "pr-5 max-md:pr-4"
            }`}
        >
            <Sidebar
                visible={visibleSidebar}
                onClose={() => setVisibleSidebar(false)}
                onClickNewChat={() => setActiveId(null)}
            />
            <div className="pt-9.5 pb-5 max-2xl:pt-5 max-md:pt-3 max-md:pb-4">
                <Header
                    onOpenSidebar={() => setVisibleSidebar(true)}
                    onToggleTools={() => setVisibleTools(!visibleTools)}
                />
                {activeId === "python" ? (
                    <PythonRunner />
                ) : activeId === "calculator" ? (
                    <Calculator />
                ) : activeId === "browser" ? (
                    <Browser />
                ) : activeId === "web-design" ? (
                    <WebDesign />
                ) : activeId === "exchange" ? (
                    <FileConverter />
                ) : activeId === "language" ? (
                    <LanguageTranslator />
                ) : activeId === "api" ? (
                    <ApiIntegrator />
                ) : (
                    children
                )}
            </div>
            <Tools
                activeId={activeId}
                setActiveId={setActiveId}
                visible={visibleTools}
                onClose={() => setVisibleTools(!visibleTools)}
            />
            <div
                className={`fixed inset-0 z-10 hidden bg-overlay backdrop-blur-sm transition-all max-lg:block max-md:hidden ${
                    visibleSidebar || !visibleTools
                        ? "visible opacity-100"
                        : "invisible opacity-0"
                }`}
                onClick={() => {
                    setVisibleSidebar(false);
                    setVisibleTools(true);
                }}
            ></div>
        </div>
    );
};

export default Layout;
