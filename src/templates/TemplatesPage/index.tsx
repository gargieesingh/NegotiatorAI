"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Image from "@/components/Image";
import Icon from "@/components/Icon";

import { content } from "./content";

const tabs = [
    {
        id: 0,
        title: "All",
        category: "all",
    },
    {
        id: 1,
        title: "✍️ Writing",
        category: "writing",
    },
    {
        id: 2,
        title: "📄 Document",
        category: "document",
    },
    {
        id: 3,
        title: "🎨 Image Generation",
        category: "image",
    },
    {
        id: 4,
        title: "🧠 Prompt Engineering",
        category: "prompt",
    },
];

const TemplatesPage = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState("");

    const activeCategory = tabs.find((t) => t.id === activeTab)?.category || "all";

    const filteredContent = content
        .filter((section) => {
            if (activeCategory === "all") return true;
            return section.category === activeCategory;
        })
        .map((section) => {
            if (!searchQuery.trim()) return section;
            const filteredItems = section.items.filter((item) =>
                item.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
            );
            return { ...section, items: filteredItems };
        })
        .filter((section) => section.items.length > 0);

    return (
        <Layout>
            <Chat
                hidePanelMessage
                titleHead={
                    <div className="flex items-center gap-2 mr-auto">
                        <Icon className="fill-strong-950" name="template" />
                        <div className="text-label-sm font-semibold text-strong-950">Templates</div>
                        <div className="px-3 py-0.5 bg-strong-950 rounded-md text-label-xs text-white-0 font-medium">
                            Beta
                        </div>
                    </div>
                }
            >
                <div className="-mx-4.5 max-md:-mx-0.5">
                    {/* Header Controls & Search in Neuratalk White Theme */}
                    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search templates..."
                                className="w-full bg-white-0 border border-stroke-soft-200 text-strong-950 placeholder:text-sub-600 focus:border-strong-950 outline-none rounded-xl px-4 py-2 text-label-sm transition-colors shadow-xs"
                            />
                        </div>
                    </div>

                    {/* Filter Tabs in Neuratalk White Theme */}
                    <div className="flex gap-1 mb-8 p-1 bg-weak-50 border border-stroke-soft-200 rounded-[0.625rem] max-md:mb-6 max-md:overflow-auto max-md:scrollbar-none">
                        {tabs.map((tab) => (
                            <button
                                className={`flex-1 h-8 rounded-lg text-label-sm transition-all duration-150 max-2xl:flex-auto max-2xl:px-3 max-md:shrink-0 ${
                                    activeTab === tab.id
                                        ? "bg-white-0 border border-stroke-soft-200 shadow-[0_0.375rem_0.625rem_0_rgba(14,18,27,0.06),0_0.125rem_0.25rem_0_rgba(14,18,27,0.03)] text-strong-950 font-semibold"
                                        : "text-sub-600 hover:text-strong-950"
                                }`}
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.title}
                            </button>
                        ))}
                    </div>

                    {/* Template Grids in Neuratalk White Theme */}
                    <div className="space-y-8">
                        {filteredContent.map((section) => (
                            <div
                                className="not-last:mb-8 max-md:not-last:mb-6"
                                key={section.id}
                            >
                                <div className="text-label-md text-sub-600 font-semibold mb-3 max-md:mb-2 max-md:text-label-sm">
                                    {section.title}
                                </div>
                                <div className="flex flex-wrap -mt-3 -mx-1.5">
                                    {section.items.map((item) => (
                                        <div
                                            className="w-[calc(33.333%-0.75rem)] mt-3 mx-1.5 p-2.5 pb-4 bg-white-0 border border-stroke-soft-200 rounded-xl shadow-[0_0.375rem_0.75rem_0_rgba(0,0,0,0.06)] cursor-pointer transition-all hover:border-strong-950 hover:shadow-md max-md:w-[calc(100%-0.75rem)]"
                                            key={item.id}
                                        >
                                            <div className="mb-3.5 pt-2 px-5.5 pb-5 bg-weak-50 border border-stroke-soft-200/50 rounded-t-lg">
                                                <Image
                                                    className="w-full object-cover rounded"
                                                    src={item.image}
                                                    width={199}
                                                    height={137}
                                                    alt={item.title}
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 px-1">
                                                <Icon
                                                    className="shrink-0 !size-4 fill-strong-950"
                                                    name="document"
                                                />
                                                <div className="truncate text-label-sm text-strong-950 font-medium">
                                                    {item.title}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        {filteredContent.length === 0 && (
                            <div className="p-8 text-center bg-white-0 border border-stroke-soft-200 rounded-xl text-sub-600 text-body-md">
                                No templates found matching your filter.
                            </div>
                        )}
                    </div>
                </div>
            </Chat>
        </Layout>
    );
};

export default TemplatesPage;
