"use client";

import { useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { Mic, Square, X, Sparkles, ArrowRight, Radio } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface VoiceAgentModalProps {
    open: boolean;
    onClose: () => void;
    onComplete?: (prompt: string) => void;
}

function parsePromptToHumanText(raw: string): string {
    if (!raw) return "";
    try {
        if (raw.includes("{")) {
            const parsed = JSON.parse(raw);
            let target = parsed;
            if (parsed.job_spec_json) {
                target = typeof parsed.job_spec_json === "string" ? JSON.parse(parsed.job_spec_json) : parsed.job_spec_json;
            }
            if (typeof target === "object" && target !== null) {
                const parts = Object.entries(target)
                    .filter(([_, v]) => Boolean(v))
                    .map(([k, v]) => `${k.replace(/_/g, " ")}: ${v}`);
                if (parts.length > 0) return parts.join(". ");
            }
        }
    } catch {}
    return raw.trim();
}

const BAR_COUNT = 32;

export default function VoiceAgentModal({ open, onClose, onComplete }: VoiceAgentModalProps) {
    const router = useRouter();
    const [transcript, setTranscript] = useState<Array<{ speaker: "agent" | "user"; text: string }>>([]);
    const [lastSpokenText, setLastSpokenText] = useState("");
    const deliveredRef = useRef(false);

    const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID || "agent_4201kxwy914hes88yjwa2vewjzc3";

    const conversation = useConversation({
        clientTools: {
            submit_job_spec: (candidate: any) => {
                const rawText = typeof candidate === "string" ? candidate : JSON.stringify(candidate);
                const cleanText = parsePromptToHumanText(lastSpokenText || rawText);
                if (!deliveredRef.current) {
                    deliveredRef.current = true;
                    toast.success("Voice brief recorded successfully!");
                    if (onComplete) {
                        onComplete(cleanText);
                    } else {
                        router.push(`/agent-run?prompt=${encodeURIComponent(cleanText)}`);
                    }
                    onClose();
                }
                return "Brief submitted. Proceeding to discovery.";
            }
        },
        onConnect: () => toast.success("Connected to Negotiator Voice Agent!"),
        onDisconnect: () => toast.info("Voice session ended."),
        onError: (err) => toast.error(`Voice error: ${String(err)}`),
        onMessage: (event: any) => {
            if (event?.message) {
                const speaker = event.source === "user" ? "user" : "agent";
                const text = event.message;
                setTranscript(prev => [...prev.slice(-8), { speaker, text }]);
                if (speaker === "user") {
                    setLastSpokenText(prev => {
                        const clean = parsePromptToHumanText(text);
                        return prev ? `${prev}. ${clean}` : clean;
                    });
                }
            }
        }
    });

    const isConnected = conversation.status === "connected";

    const handleToggleSession = async () => {
        if (isConnected) {
            await conversation.endSession();
        } else {
            try {
                deliveredRef.current = false;
                setTranscript([]);
                setLastSpokenText("");
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const universalConfig = {
                    displayName: "Universal Procurement & Price Negotiation",
                    summary: "Negotiate prices, compare rates, and secure itemized deals for ANY legal product, service, rental, vehicle, hiring, freelancing project, or commercial deal.",
                    intakeFields: [
                        { key: "item_or_service", label: "Item / Service / Deal Name", type: "text", required: true },
                        { key: "location_or_region", label: "Location / Region", type: "text", required: true },
                        { key: "timeline_or_duration", label: "Timeline / Duration", type: "text", required: true },
                        { key: "specifications", label: "Specifications & Requirements", type: "textarea", required: false }
                    ],
                };
                await conversation.startSession({
                    agentId,
                    dynamicVariables: {
                        vertical_config: JSON.stringify(universalConfig),
                        intake_fields: "item_or_service, location_or_region, timeline_or_duration, specifications",
                        system_prompt: "You are Negotiator AI, a universal autonomous procurement and price negotiation agent. You help users negotiate, price-shop, and compare rates for ANY legal product, service, rental, hiring, freelancing project, car on demand, repair, venue, or commercial deal. Greet the user warmly and ask what deal, purchase, service, or hire they want to negotiate today.",
                        prompt: "You are Negotiator AI, a universal procurement and price negotiation assistant.",
                        role: "Universal Procurement & Price Negotiation AI Agent"
                    }
                });
            } catch (err: any) {
                toast.error(err.message || "Microphone access failed.");
            }
        }
    };

    const handleDoneAndRun = () => {
        const userLines = transcript.filter(t => t.speaker === "user").map(t => parsePromptToHumanText(t.text)).filter(Boolean);
        const fullText = userLines.join(". ") || lastSpokenText || "Local service quote request";
        const finalPrompt = parsePromptToHumanText(fullText);
        if (isConnected) conversation.endSession();
        if (onComplete) {
            onComplete(finalPrompt);
        } else {
            router.push(`/agent-run?prompt=${encodeURIComponent(finalPrompt)}`);
        }
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[rgba(0,0,0,0.4)] backdrop-blur-sm">
            <div className="relative w-full max-w-lg bg-white-0 border border-stroke-soft-200 rounded-3xl shadow-[0_0_2rem_0_rgba(0,0,0,0.08)] overflow-hidden max-h-[85vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stroke-soft-200 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="size-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                            <Sparkles className="size-4 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-strong-950">Negotiator Voice Agent</h3>
                            <p className="text-[11px] text-sub-600">Real-time Conversational AI Briefing</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="size-8 rounded-full border border-stroke-soft-200 flex items-center justify-center text-sub-600 hover:text-strong-950 hover:bg-weak-50 transition cursor-pointer"
                    >
                        <X className="size-4" />
                    </button>
                </div>

                {/* Body */}
                <div className="overflow-y-auto scrollbar-none grow px-6 py-5 space-y-5">

                    {/* Mic + Waveform row */}
                    <div className="flex items-center gap-4">
                        {/* Mic button */}
                        <button
                            onClick={handleToggleSession}
                            className={`flex-shrink-0 size-14 rounded-full flex flex-col items-center justify-center gap-0.5 border-2 transition-all cursor-pointer ${
                                isConnected
                                    ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100"
                                    : "border-blue-400 bg-blue-50 text-blue-600 hover:bg-blue-100"
                            }`}
                        >
                            {isConnected ? (
                                <>
                                    <Square className="size-5 fill-current" />
                                    <span className="text-[8px] font-bold uppercase tracking-wider">Stop</span>
                                </>
                            ) : (
                                <>
                                    <Mic className="size-5" />
                                    <span className="text-[8px] font-bold uppercase tracking-wider">Start</span>
                                </>
                            )}
                        </button>

                        {/* Waveform bars */}
                        <div className="flex items-center gap-[2px] h-10 flex-1">
                            {Array.from({ length: BAR_COUNT }).map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-[3px] rounded-full transition-all ${
                                        isConnected ? "bg-blue-500" : "bg-stroke-soft-200"
                                    }`}
                                    style={{
                                        height: isConnected
                                            ? `${30 + Math.sin(i * 0.8) * 40}%`
                                            : `${15 + Math.sin(i * 0.5) * 10}%`,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Status badge */}
                        <span className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            isConnected
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-stroke-soft-200 bg-weak-50 text-sub-600"
                        }`}>
                            <span className={`size-1.5 rounded-full ${isConnected ? "bg-blue-500" : "bg-soft-400"}`} />
                            {isConnected ? "Listening" : "Ready"}
                        </span>
                    </div>

                    {/* Hint */}
                    {!isConnected && transcript.length === 0 && (
                        <p className="text-xs text-sub-600 leading-relaxed">
                            Press <strong className="text-strong-950">Start</strong> to begin a real voice conversation. Tell the agent what you need — service, product, or deal — and it will capture your brief and run the agent.
                        </p>
                    )}

                    {/* Transcript */}
                    {transcript.length > 0 && (
                        <div className="space-y-2 max-h-52 overflow-y-auto scrollbar-none">
                            {transcript.map((line, idx) => (
                                <div key={idx} className={`flex gap-2 ${line.speaker === "user" ? "justify-end" : "justify-start"}`}>
                                    {line.speaker === "agent" && (
                                        <div className="flex-shrink-0 size-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                                            <Radio size={10} className="text-blue-600" />
                                        </div>
                                    )}
                                    <p className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                        line.speaker === "agent"
                                            ? "bg-weak-50 border border-stroke-soft-200 text-strong-950"
                                            : "bg-blue-600 text-white-0"
                                    }`}>
                                        {line.text}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 pb-5 pt-4 border-t border-stroke-soft-200 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-xs font-semibold text-sub-600 hover:text-strong-950 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDoneAndRun}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white-0 font-semibold text-xs hover:bg-blue-700 transition shadow-xs cursor-pointer"
                    >
                        <span>Confirm Brief & Run Agent</span>
                        <ArrowRight className="size-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
