"use client";

import { useState } from "react";
import Layout from "@/components/Layout";
import Chat from "@/components/Chat";
import Question from "@/components/Question";
import Answer from "@/components/Answer";
import Icon from "@/components/Icon";
import { Sparkles, Copy, Check, RefreshCw, Send, SlidersHorizontal, BookOpen } from "lucide-react";
import { toast } from "sonner";

const presetFormats = [
    { id: "email", label: "Cold Sales Email Pitch" },
    { id: "landing", label: "Landing Page Hero & Copy" },
    { id: "ad", label: "Social Media Ad Copy" },
    { id: "proposal", label: "Negotiation Counterproposal" },
];

const toneOptions = [
    "Persuasive & Sales-Driven",
    "Professional & Formal",
    "Witty & Engaging",
    "Urgent & Direct",
    "Empathetic & Warm"
];

const WriteCopyPage = () => {
    const [brief, setBrief] = useState("Propose a 15% discount for bulk ordering 500 units of custom ergonomic office chairs with net-30 payment terms.");
    const [selectedFormat, setSelectedFormat] = useState("proposal");
    const [selectedTone, setSelectedTone] = useState("Persuasive & Sales-Driven");
    const [audience, setAudience] = useState("Enterprise Procurement Director & Vendor Account Managers");
    const [isGenerating, setIsGenerating] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

    const [generatedVariants, setGeneratedVariants] = useState([
        {
            id: 1,
            title: "Option A: Value-Focused Counterproposal",
            copy: `Subject: Strategic Procurement Proposal - Bulk Ergonomic Seating Order (Ref: #ORDER-500)

Dear Account Management Team,

Thank you for providing the initial quote for 500 units of Ergonomic Executive Office Chairs.

We are prepared to finalize our order immediately upon alignment on commercial terms. Based on market benchmarks and our recurring purchase commitment over the next 12 months, we propose a revised unit rate reflecting a 15% volume discount, structured with net-30 billing payment terms.

This agreement establishes a long-term partnership with guaranteed quarterly expansion orders. Please find our attached purchase order draft for review.

Sincerely,
Strategic Procurement Team`,
        },
        {
            id: 2,
            title: "Option B: Direct & Urgency-Driven Negotiation Pitch",
            copy: `Subject: Finalizing Purchase Order #500-CHAIRS - Revised Commercial Terms

Hi Team,

Our procurement committee has reviewed your proposal for the 500 chair supply package.

To secure budget sign-off prior to close of business Friday, we require two adjustments:
1. A 15% volume adjustment applied to the base unit price.
2. Standard Net-30 payment schedule upon dock delivery.

We are ready to execute the contract today if these terms are confirmed. Let us know if we can finalize the agreement before 5 PM.

Best regards,
Head of Operations`,
        }
    ]);

    const handleGenerate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!brief.trim()) {
            toast.error("Please enter a brief or prompt for the copywriter.");
            return;
        }

        setIsGenerating(true);
        setTimeout(() => {
            setGeneratedVariants([
                {
                    id: Date.now(),
                    title: `Generated ${selectedFormat.toUpperCase()} (${selectedTone})`,
                    copy: `Subject: ${brief.slice(0, 45)}...\n\nHello,\n\nBased on your requested brief, here is tailored copy optimized for ${audience}:\n\n${brief}\n\nWe recommend framing this with clear commercial benefits and mutual incentives to ensure maximum alignment and rapid agreement.\n\nBest regards,\nNeuratalk AI Copy Engine`,
                },
                ...generatedVariants
            ]);
            setIsGenerating(false);
            toast.success("New copy draft generated successfully!");
        }, 1200);
    };

    const handleCopyCopywriterText = (text: string, index: number) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        toast.success("Copywriter output copied to clipboard!");
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    return (
        <Layout>
            <Chat
                titleHead={
                    <div className="flex items-center gap-2 mr-auto">
                        <Icon className="fill-strong-950" name="edit" />
                        <div className="text-label-sm font-semibold text-strong-950">AI Copywriter Engine</div>
                        <div className="px-3 py-0.5 bg-strong-950 rounded-md text-label-xs text-white-0 font-medium">
                            Neuratalk White
                        </div>
                    </div>
                }
            >
                <div className="space-y-8">
                    {/* Copywriter Inputs Form Section in Neuratalk White Theme */}
                    <div className="bg-white-0 border border-stroke-soft-200 rounded-2xl p-6 shadow-[0_0.375rem_0.75rem_0_rgba(0,0,0,0.06)]">
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stroke-soft-200">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="size-4 text-strong-950" />
                                <h2 className="text-strong-950 text-label-md font-bold">Copywriter Inputs & Parameters</h2>
                            </div>
                            <span className="text-caption-xs text-sub-600 bg-weak-50 border border-stroke-soft-200 px-2.5 py-1 rounded-md">
                                High Converting Presets
                            </span>
                        </div>

                        <form onSubmit={handleGenerate} className="space-y-4">
                            {/* Brief Input */}
                            <div>
                                <label className="block text-strong-950 text-label-sm font-semibold mb-1">
                                    Project Brief / Prompt
                                </label>
                                <p className="text-sub-600 text-caption-xs mb-2">
                                    Describe what you want to write (e.g., offer details, value props, terms, target outcome).
                                </p>
                                <textarea
                                    value={brief}
                                    onChange={(e) => setBrief(e.target.value)}
                                    rows={3}
                                    placeholder="Enter your copywriting requirements..."
                                    className="w-full bg-white-0 border border-stroke-soft-200 text-strong-950 placeholder:text-sub-600 focus:border-strong-950 outline-none rounded-xl p-3 text-body-sm transition-colors shadow-xs resize-none"
                                />
                            </div>

                            {/* Options Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Format Selection */}
                                <div>
                                    <label className="block text-strong-950 text-label-sm font-semibold mb-1.5">
                                        Copy Format Preset
                                    </label>
                                    <select
                                        value={selectedFormat}
                                        onChange={(e) => setSelectedFormat(e.target.value)}
                                        className="w-full bg-white-0 border border-stroke-soft-200 text-strong-950 focus:border-strong-950 outline-none rounded-xl p-2.5 text-label-sm cursor-pointer"
                                    >
                                        {presetFormats.map((f) => (
                                            <option key={f.id} value={f.id}>
                                                {f.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tone of Voice */}
                                <div>
                                    <label className="block text-strong-950 text-label-sm font-semibold mb-1.5">
                                        Tone of Voice
                                    </label>
                                    <select
                                        value={selectedTone}
                                        onChange={(e) => setSelectedTone(e.target.value)}
                                        className="w-full bg-white-0 border border-stroke-soft-200 text-strong-950 focus:border-strong-950 outline-none rounded-xl p-2.5 text-label-sm cursor-pointer"
                                    >
                                        {toneOptions.map((t) => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Target Audience */}
                                <div>
                                    <label className="block text-strong-950 text-label-sm font-semibold mb-1.5">
                                        Target Audience
                                    </label>
                                    <input
                                        type="text"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value)}
                                        placeholder="e.g. Enterprise Procurement Directors"
                                        className="w-full bg-white-0 border border-stroke-soft-200 text-strong-950 placeholder:text-sub-600 focus:border-strong-950 outline-none rounded-xl p-2.5 text-label-sm"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2 flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isGenerating}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-strong-950 hover:bg-strong-950/90 text-white-0 font-semibold rounded-xl text-label-sm transition-all shadow-md disabled:opacity-50"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="size-4 animate-spin" />
                                            <span>Generating Copy...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="size-4" />
                                            <span>Generate Copy Draft</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Generated Copywriter Outputs Section in Neuratalk White Theme */}
                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h3 className="text-strong-950 text-label-md font-bold flex items-center gap-2">
                                <BookOpen className="size-4 text-strong-950" />
                                Generated Copy Output Variants
                            </h3>
                            <span className="text-caption-xs text-sub-600">
                                {generatedVariants.length} Drafts Available
                            </span>
                        </div>

                        <div className="grid grid-cols-1 gap-5">
                            {generatedVariants.map((variant, idx) => (
                                <div
                                    key={variant.id}
                                    className="bg-white-0 border border-stroke-soft-200 rounded-2xl p-5 shadow-[0_0.375rem_0.75rem_0_rgba(0,0,0,0.06)] hover:border-strong-950 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-stroke-soft-200">
                                        <h4 className="text-strong-950 text-label-sm font-bold">
                                            {variant.title}
                                        </h4>
                                        <button
                                            onClick={() => handleCopyCopywriterText(variant.copy, idx)}
                                            className="flex items-center gap-1.5 px-3 py-1 bg-white-0 border border-stroke-soft-200 hover:bg-weak-50 text-strong-950 rounded-lg text-label-xs font-medium transition-colors"
                                        >
                                            {copiedIndex === idx ? (
                                                <>
                                                    <Check className="size-3.5 text-emerald-600" />
                                                    <span className="text-emerald-600">Copied</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="size-3.5" />
                                                    <span>Copy Text</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-4 bg-weak-50 border border-stroke-soft-200 rounded-xl text-sub-600 text-body-sm font-mono whitespace-pre-wrap leading-relaxed">
                                        {variant.copy}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Interactive Q&A Breakdown Section in Neuratalk White Theme */}
                    <div className="pt-6 border-t border-stroke-soft-200 space-y-6">
                        <Question>
                            <div className="text-strong-950 font-medium">
                                <p>Can you structure a comparative reference matrix for common negotiation and mental health support frameworks?</p>
                            </div>
                        </Question>

                        <Answer>
                            <div className="flex flex-col gap-2">
                                <p className="text-sub-600">
                                    Here is a Neuratalk white-themed comparative summary table detailing common challenges and strategic resolution pathways:
                                </p>
                                <div className="max-md:overflow-auto max-md:scrollbar-none max-md:-mr-4 max-md:pr-4 mt-2">
                                    <table className="w-full table-fixed bg-white-0 border border-stroke-soft-200 rounded-xl overflow-hidden [&_th]:bg-weak-50 [&_th]:text-strong-950 [&_th]:text-left [&_th]:font-semibold [&_td,&_th]:py-3 [&_td,&_th]:px-4 [&_td,&_th]:border-b [&_td,&_th]:border-stroke-soft-200 [&_td]:text-sub-600 [&_td]:align-top max-md:w-160">
                                        <thead>
                                            <tr>
                                                <th className="w-1/3">Focus Area</th>
                                                <th className="w-1/3">Core Objective</th>
                                                <th className="w-1/3">Actionable Framework</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="font-semibold text-strong-950">Commercial Negotiation</td>
                                                <td>Maximize contract value while preserving partner relationships.</td>
                                                <td>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>Establish clear reservation price bounds.</li>
                                                        <li>Package multiple items into bundled offers.</li>
                                                        <li>Leverage competitive benchmark data.</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold text-strong-950">Operational Stress Management</td>
                                                <td>Reduce cognitive fatigue and increase focus during high-stakes deals.</td>
                                                <td>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>Structured time-blocking and breaks.</li>
                                                        <li>Autonomous task delegation to AI agents.</li>
                                                        <li>Objective risk metrics assessment.</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="font-semibold text-strong-950">Communication Clarity</td>
                                                <td>Eliminate ambiguity in SLA contracts and customer deliverables.</td>
                                                <td>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        <li>Use structured bullet points.</li>
                                                        <li>Define explicit review timelines.</li>
                                                        <li>Provide itemized cost breakdowns.</li>
                                                    </ul>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </Answer>
                    </div>
                </div>
            </Chat>
        </Layout>
    );
};

export default WriteCopyPage;
