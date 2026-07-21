"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import VoiceChat from "@/components/VoiceChat";
import Icon from "@/components/Icon";
import { Search, FileText, Download, Copy, Sparkles, CheckCircle2, TrendingDown, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const researchSummaries = [
    {
        id: "res-1",
        title: "Wedding Photography Vendor Price & Package Breakdown",
        category: "Vendor Benchmarking",
        date: "Updated 2 hrs ago",
        status: "High Leverage",
        description: "Comparative market analysis across 14 top-rated wedding photographers in Delhi & NCR region.",
        metrics: [
            { label: "Avg Market Quote", value: "$3,200" },
            { label: "Target Negotiated Price", value: "$2,450" },
            { label: "Est. Savings Margin", value: "23.4%" },
        ],
        insights: [
            "Off-peak Sunday dates offer automatic 15% rate concession across 80% of surveyed studios.",
            "Raw footage rights are usually bundled for free if requested before signing contract.",
            "Drone coverage add-ons have a 40% markup buffer open for counteroffer."
        ],
        tags: ["Events", "Photography", "Rate Card"]
    },
    {
        id: "res-2",
        title: "Commercial Office Lease SLA & Clause Risk Summary",
        category: "Real Estate & Legal",
        date: "Updated Yesterday",
        status: "Action Required",
        description: "Deep-dive clause analysis on commercial lease agreements for 3,500 sq ft office space.",
        metrics: [
            { label: "Base Escalation Rate", value: "5.0% / yr" },
            { label: "Benchmark Escalation", value: "3.5% / yr" },
            { label: "Overpriced Maintenance", value: "+$420 / mo" },
        ],
        insights: [
            "Landlord maintenance fee includes unmonitored common-area utility allocation.",
            "Sublease authorization clause lacks clear response deadline requirement.",
            "3-month rent-free fit-out period is standard for current vacancy rates in the sub-market."
        ],
        tags: ["Lease", "Legal SLA", "Commercial"]
    },
    {
        id: "res-3",
        title: "SaaS Enterprise Tier Seat Licensing & Discount Matrix",
        category: "Software Procurement",
        date: "Updated 3 days ago",
        status: "Optimal Strategy",
        description: "Analysis of annual vs multi-year commitment terms for customer CRM software migration.",
        metrics: [
            { label: "List Price / Seat", value: "$85 / mo" },
            { label: "Negotiated Rate", value: "$52 / mo" },
            { label: "Annual Contract Value", value: "$31,200" },
        ],
        insights: [
            "End-of-quarter quota timelines unlock up to 38% extra discount on annual pre-pay.",
            "Unused seat true-up clause should be waived in favor of semi-annual re-balancing.",
            "Premium customer support package can be included as a zero-cost deal sweetener."
        ],
        tags: ["SaaS", "IT Licensing", "Procurement"]
    },
    {
        id: "res-4",
        title: "Automotive Repair Estimate & OEM Parts Price Benchmark",
        category: "Auto & Services",
        date: "Updated July 20, 2026",
        status: "Verified",
        description: "Part-by-part market rate audit for brake pad, rotor replacement, and 60k mile major service.",
        metrics: [
            { label: "Dealership Quote", value: "$1,840" },
            { label: "Independent Shop Avg", value: "$1,120" },
            { label: "Part Cost Variance", value: "-39.1%" },
        ],
        insights: [
            "OEM pad set prices carry 65% markup at main dealership vs certified distributor.",
            "Labor rate at certified independent specialists is $115/hr vs $210/hr at dealership.",
            "Warranty coverage remains intact when using OEM-equivalent certified components."
        ],
        tags: ["Automotive", "Parts Audit", "Repair"]
    }
];

const ResearchPage = () => {
    const [activeTab, setActiveTab] = useState<"summaries" | "voice">("summaries");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    const categories = ["All", "Vendor Benchmarking", "Real Estate & Legal", "Software Procurement", "Auto & Services"];

    const filteredSummaries = researchSummaries.filter((item) => {
        const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
        const matchesSearch =
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Research summary copied to clipboard!");
    };

    return (
        <Layout>
            <Chat
                hidePanelMessage
                titleHead={
                    <div className="flex items-center gap-2 mr-auto">
                        <Icon className="fill-strong-950" name="document" />
                        <div className="text-label-sm font-semibold text-strong-950">Research & Intelligence</div>
                        <div className="px-3 py-0.5 bg-strong-950 rounded-md text-label-xs text-white-0 font-medium">
                            Neuratalk White
                        </div>
                    </div>
                }
            >
                <div className="-mx-4.5 max-md:-mx-0.5">
                    {/* View Switcher Tabs in Neuratalk White Theme */}
                    <div className="flex gap-2 mb-6 p-1 bg-weak-50 border border-stroke-soft-200 rounded-[0.625rem]">
                        <button
                            onClick={() => setActiveTab("summaries")}
                            className={`flex-1 py-2 rounded-lg text-label-sm font-medium transition-all ${
                                activeTab === "summaries"
                                    ? "bg-white-0 border border-stroke-soft-200 text-strong-950 shadow-[0_0.375rem_0.625rem_0_rgba(14,18,27,0.06)] font-semibold"
                                    : "text-sub-600 hover:text-strong-950"
                            }`}
                        >
                            📊 Market Research Summaries
                        </button>
                        <button
                            onClick={() => setActiveTab("voice")}
                            className={`flex-1 py-2 rounded-lg text-label-sm font-medium transition-all ${
                                activeTab === "voice"
                                    ? "bg-white-0 border border-stroke-soft-200 text-strong-950 shadow-[0_0.375rem_0.625rem_0_rgba(14,18,27,0.06)] font-semibold"
                                    : "text-sub-600 hover:text-strong-950"
                            }`}
                        >
                            🎙️ Voice Research Assistant
                        </button>
                    </div>

                    {activeTab === "summaries" ? (
                        <div className="space-y-6">
                            {/* Search and Category Bar */}
                            <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                                <div className="relative w-full md:w-80">
                                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-sub-600" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search research summaries..."
                                        className="w-full pl-10 pr-4 py-2 bg-white-0 border border-stroke-soft-200 rounded-xl text-label-sm text-strong-950 placeholder:text-sub-600 focus:border-strong-950 outline-none transition-colors shadow-xs"
                                    />
                                </div>
                                <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-3 py-1.5 rounded-lg text-label-xs font-medium shrink-0 transition-colors ${
                                                selectedCategory === cat
                                                    ? "bg-strong-950 text-white-0"
                                                    : "bg-white-0 border border-stroke-soft-200 text-sub-600 hover:text-strong-950"
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Research Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {filteredSummaries.map((summary) => (
                                    <div
                                        key={summary.id}
                                        className="bg-white-0 border border-stroke-soft-200 rounded-2xl p-5 shadow-[0_0.375rem_0.75rem_0_rgba(0,0,0,0.06)] hover:border-strong-950 transition-all flex flex-col justify-between"
                                    >
                                        <div>
                                            {/* Header badge row */}
                                            <div className="flex items-center justify-between gap-2 mb-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="px-2.5 py-0.5 bg-weak-50 border border-stroke-soft-200 text-sub-600 rounded-md text-label-xs font-medium">
                                                        {summary.category}
                                                    </span>
                                                    <span className="text-caption-xs text-sub-600">
                                                        {summary.date}
                                                    </span>
                                                </div>
                                                <span className="px-2.5 py-0.5 bg-strong-950 text-white-0 rounded-full text-label-xs font-semibold">
                                                    {summary.status}
                                                </span>
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-strong-950 text-label-lg font-bold mb-2 leading-snug">
                                                {summary.title}
                                            </h3>

                                            {/* Description */}
                                            <p className="text-sub-600 text-body-sm mb-4">
                                                {summary.description}
                                            </p>

                                            {/* Key Metrics grid */}
                                            <div className="grid grid-cols-3 gap-2 p-3 bg-weak-50 border border-stroke-soft-200 rounded-xl mb-4">
                                                {summary.metrics.map((m, idx) => (
                                                    <div key={idx} className="text-center">
                                                        <div className="text-caption-xs text-sub-600 font-medium">
                                                            {m.label}
                                                        </div>
                                                        <div className="text-strong-950 text-label-sm font-bold mt-0.5">
                                                            {m.value}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Key Leverage Insights */}
                                            <div className="space-y-2 mb-4">
                                                <div className="text-label-xs font-semibold text-strong-950 flex items-center gap-1.5">
                                                    <Sparkles className="size-3.5 text-strong-950" />
                                                    Key Negotiation Insights
                                                </div>
                                                <ul className="space-y-1.5">
                                                    {summary.insights.map((insight, idx) => (
                                                        <li key={idx} className="flex items-start gap-2 text-sub-600 text-caption-xs leading-relaxed">
                                                            <CheckCircle2 className="size-3.5 text-strong-950 shrink-0 mt-0.5" />
                                                            <span>{insight}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Card Footer Actions */}
                                        <div className="pt-3 border-t border-stroke-soft-200 flex items-center justify-between gap-2 mt-2">
                                            <div className="flex gap-1.5 flex-wrap">
                                                {summary.tags.map((tag) => (
                                                    <span key={tag} className="text-caption-xs text-sub-600 bg-weak-50 border border-stroke-soft-200 px-2 py-0.5 rounded-md">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                <button
                                                    onClick={() => handleCopy(`${summary.title}\n${summary.description}`)}
                                                    className="p-1.5 bg-white-0 border border-stroke-soft-200 hover:bg-weak-50 text-strong-950 rounded-lg transition-colors"
                                                    title="Copy Summary"
                                                >
                                                    <Copy className="size-4" />
                                                </button>
                                                <button
                                                    onClick={() => toast.info(`Exporting report for: ${summary.title}`)}
                                                    className="flex items-center gap-1 px-3 py-1.5 bg-strong-950 hover:bg-strong-950/90 text-white-0 rounded-lg text-label-xs font-medium transition-colors"
                                                >
                                                    <Download className="size-3.5" />
                                                    <span>Export</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-white-0 border border-stroke-soft-200 rounded-2xl shadow-[0_0.375rem_0.75rem_0_rgba(0,0,0,0.06)]">
                            <VoiceChat />
                        </div>
                    )}
                </div>
            </Chat>
        </Layout>
    );
};

export default ResearchPage;
