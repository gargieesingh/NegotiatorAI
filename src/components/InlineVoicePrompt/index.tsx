"use client";

import { useState, useRef } from "react";
import { useConversation } from "@11labs/react";
import { Mic, Square, Sparkles, Send, Keyboard, Radio, FileText, X, ArrowRight, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface InlineVoicePromptProps {
    prompt: string;
    setPrompt: (text: string) => void;
    fileUploaded: File | null;
    onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmitText: (e: React.FormEvent) => void;
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

const BAR_COUNT = 44;

function VoiceAgentLogo({ className = "size-4" }: { className?: string }) {
    return (
        <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="size-full">
                <defs>
                    <linearGradient id="voiceLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#335cff" />
                        <stop offset="100%" stopColor="#7d52f4" />
                    </linearGradient>
                </defs>
                {/* Dynamic AI Audio Equalizer Bars */}
                <rect x="3" y="9" width="2.5" height="6" rx="1.25" fill="url(#voiceLogoGrad)" />
                <rect x="8" y="4" width="2.5" height="16" rx="1.25" fill="url(#voiceLogoGrad)" />
                <rect x="13" y="7" width="2.5" height="10" rx="1.25" fill="url(#voiceLogoGrad)" />
                <rect x="18" y="10" width="2.5" height="4" rx="1.25" fill="url(#voiceLogoGrad)" />
                {/* AI Sparkle Accent */}
                <path d="M19 2L19.7 3.3L21 4L19.7 4.7L19 6L18.3 4.7L17 4L18.3 3.3L19 2Z" fill="#7d52f4" />
            </svg>
        </div>
    );
}

export default function InlineVoicePrompt({
    prompt,
    setPrompt,
    fileUploaded,
    onFileChange,
    onSubmitText,
}: InlineVoicePromptProps) {
    const router = useRouter();
    const [isVoiceActive, setIsVoiceActive] = useState(false);
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
                    setTimeout(() => setPrompt(cleanText), 0);
                    toast.success("Voice brief recorded!");
                    router.push(`/agent-run?prompt=${encodeURIComponent(cleanText)}`);
                }
                return "Brief submitted. Proceeding to discovery.";
            }
        },
        onConnect: () => toast.success("Connected to Voice Assistant!"),
        onDisconnect: () => toast.info("Voice session ended."),
        onError: (err) => toast.error(`Voice error: ${String(err)}`),
        onMessage: (event: any) => {
            if (event?.message) {
                const speaker = event.source === "user" ? "user" : "agent";
                const text = event.message;
                setTranscript(prev => [...prev.slice(-4), { speaker, text }]);
                if (speaker === "user") {
                    const clean = parsePromptToHumanText(text);
                    setLastSpokenText(prev => {
                        const updated = prev ? `${prev}. ${clean}` : clean;
                        setTimeout(() => setPrompt(updated), 0);
                        return updated;
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
                        system_prompt: "You are Negotiator AI, a universal autonomous procurement and price negotiation agent. Greet the user warmly and ask what deal, purchase, service, or hire they want to negotiate today.",
                        prompt: "You are Negotiator AI, a universal procurement and price negotiation assistant.",
                        role: "Universal Procurement & Price Negotiation AI Agent"
                    }
                });
            } catch (err: any) {
                toast.error(err.message || "Microphone access failed.");
            }
        }
    };

    const handleOpenVoice = () => {
        setIsVoiceActive(true);
        handleToggleSession();
    };

    const handleCloseVoice = () => {
        if (isConnected) conversation.endSession();
        setIsVoiceActive(false);
    };

    const handleRunVoiceAgent = () => {
        const userLines = transcript.filter(t => t.speaker === "user").map(t => parsePromptToHumanText(t.text)).filter(Boolean);
        const fullText = userLines.join(". ") || lastSpokenText || prompt || "Local service quote request";
        const finalPrompt = parsePromptToHumanText(fullText);
        if (isConnected) conversation.endSession();
        toast.success("Initializing Autonomous Agent...");
        router.push(`/agent-run?prompt=${encodeURIComponent(finalPrompt)}`);
    };

    const latestTurn = transcript[transcript.length - 1];

    return (
        <>
            {/* Standard Compact Prompt Box */}
            <div className="w-full bg-white-0 rounded-2xl p-4 border border-stroke-soft-200 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] transition-all">
                <form onSubmit={onSubmitText}>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe what you want priced, hired, rented, or negotiated..."
                        className="w-full bg-transparent border-0 outline-none resize-none text-strong-950 text-label-md py-1 px-2 placeholder:text-soft-400 focus:ring-0 min-h-[56px] scrollbar-none"
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                onSubmitText(e);
                            }
                        }}
                    />

                    <div className="flex items-center justify-between border-t border-stroke-soft-200 pt-3 mt-2">
                        <div className="flex items-center gap-2.5">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-weak-50 border border-stroke-soft-200 hover:bg-soft-200 cursor-pointer transition text-label-xs text-sub-600">
                                <FileText className="size-3.5 text-sub-600" />
                                <span>{fileUploaded ? fileUploaded.name.slice(0, 15) + "..." : "Attach Quote/Doc"}</span>
                                <input type="file" onChange={onFileChange} accept=".pdf,.png" className="hidden" />
                            </label>

                            <button
                                type="button"
                                onClick={handleOpenVoice}
                                className="group flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 text-blue-700 hover:from-blue-100 hover:to-purple-100 transition cursor-pointer text-label-xs font-bold shadow-2xs"
                                title="Start Real Voice Assistant"
                            >
                                <VoiceAgentLogo className="size-4 group-hover:scale-110 transition-transform" />
                                <span>Voice Agent</span>
                            </button>
                        </div>

                        <button
                            type="submit"
                            className="inline-flex items-center gap-2.5 h-10 pl-5 pr-2.5 rounded-full text-label-sm font-bold text-white-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 cursor-pointer shadow-[0_2px_10px_-2px_rgba(51,92,255,0.4)] hover:shadow-[0_4px_16px_-2px_rgba(51,92,255,0.6)] active:scale-[0.98]"
                        >
                            <span>Run Agent</span>
                            <span className="size-6 rounded-full bg-white-0/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                                <Sparkles className="size-3.5 text-white-0 fill-white-0" />
                            </span>
                        </button>
                    </div>
                </form>
            </div>

            {/* Immersive ChatGPT / Gemini Live Voice Mode Screen */}
            {isVoiceActive && (
                <div className="fixed inset-0 z-50 bg-white-0 flex flex-col items-center justify-between p-8 max-md:p-4 animate-fade-in">
                    
                    {/* Top Bar */}
                    <div className="w-full max-w-4xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                            <div className="size-9 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                                <Sparkles className="size-4 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-strong-950 font-inter">Negotiator AI Voice Mode</h3>
                                <p className="text-[11px] text-sub-600 font-medium">Real-time Conversational Intake</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                                isConnected ? "bg-blue-50 border border-blue-200 text-blue-700" : "bg-weak-50 border border-stroke-soft-200 text-sub-600"
                            }`}>
                                <span className={`size-2 rounded-full ${isConnected ? "bg-blue-600 animate-ping" : "bg-soft-400"}`} />
                                {isConnected ? "Live Conversation" : "Connecting..."}
                            </span>

                            <button
                                type="button"
                                onClick={handleCloseVoice}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-weak-50 border border-stroke-soft-200 text-sub-600 hover:text-strong-950 hover:bg-stroke-soft-200 transition text-xs font-semibold cursor-pointer"
                            >
                                <Keyboard className="size-4" />
                                <span>Exit Voice</span>
                            </button>
                        </div>
                    </div>

                    {/* Center Immersive Aura Voice Orb */}
                    <div className="flex flex-col items-center justify-center text-center my-auto py-6">
                        
                        {/* Aura Glow Orb */}
                        <div className="relative size-36 mb-8 flex items-center justify-center">
                            {isConnected && (
                                <>
                                    <div className="absolute -inset-4 rounded-full bg-blue-500/20 animate-ping" />
                                    <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-blue-500/15 via-indigo-500/15 to-cyan-500/15 animate-pulse blur-md" />
                                </>
                            )}

                            <button
                                type="button"
                                onClick={handleToggleSession}
                                className={`relative z-10 size-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl cursor-pointer ${
                                    isConnected
                                        ? "bg-gradient-to-tr from-red-500 to-rose-600 text-white-0 scale-105"
                                        : "bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-600 text-white-0 shadow-[0_0_2.5rem_0_rgba(51,92,255,0.3)] hover:scale-105"
                                }`}
                            >
                                {isConnected ? <Square className="size-8 fill-white-0" /> : <Mic className="size-9 text-white-0" />}
                            </button>
                        </div>

                        {/* Frequency Wave Visualizer */}
                        <div className="flex items-center justify-center gap-[3px] h-10 w-full max-w-md mb-6">
                            {Array.from({ length: BAR_COUNT }).map((_, i) => {
                                const baseH = 20 + Math.sin(i * 0.5) * 40;
                                const delay = (i % 8) * 0.06;
                                return (
                                    <span
                                        key={i}
                                        className={`w-[3px] rounded-full transition-all duration-200 ${
                                            isConnected
                                                ? "bg-gradient-to-t from-blue-600 via-blue-500 to-cyan-400"
                                                : "bg-stroke-soft-200 h-2"
                                        }`}
                                        style={
                                            isConnected
                                                ? {
                                                      height: `${baseH}%`,
                                                      animation: `bar-wave-full ${0.35 + (i % 5) * 0.1}s ease-in-out infinite alternate`,
                                                      animationDelay: `${delay}s`,
                                                  }
                                                : undefined
                                        }
                                    />
                                );
                            })}
                        </div>

                        {/* Live Caption Text */}
                        <div className="max-w-xl min-h-[60px] flex items-center justify-center px-4">
                            {latestTurn ? (
                                <p className="text-base font-medium text-strong-950 leading-relaxed text-center animate-fade-in">
                                    <span className="text-xs font-bold uppercase tracking-wider text-blue-600 mr-2">
                                        {latestTurn.speaker === "agent" ? "Negotiator AI:" : "You:"}
                                    </span>
                                    "{latestTurn.text}"
                                </p>
                            ) : (
                                <p className="text-sm text-sub-600 font-medium">
                                    {isConnected
                                        ? "Tell Negotiator AI what product, service, rental, or contractor quotes you need..."
                                        : "Tap the mic orb to start real voice conversation"}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Controls */}
                    <div className="w-full max-w-2xl flex items-center justify-between border-t border-stroke-soft-200 pt-6">
                        <div className="text-xs text-sub-600 font-medium truncate max-w-sm">
                            {prompt ? (
                                <span className="text-strong-950 font-semibold">Captured: "{prompt}"</span>
                            ) : (
                                <span>Voice Mode Active</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleRunVoiceAgent}
                            className="inline-flex items-center gap-2.5 h-11 pl-6 pr-3 rounded-full text-label-sm font-bold text-white-0 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 cursor-pointer shadow-[0_2px_12px_-2px_rgba(51,92,255,0.4)] hover:shadow-[0_4px_18px_-2px_rgba(51,92,255,0.6)] active:scale-[0.98]"
                        >
                            <span>Confirm & Run Agent</span>
                            <span className="size-6.5 rounded-full bg-white-0/20 backdrop-blur-xs flex items-center justify-center shrink-0">
                                <Sparkles className="size-3.5 text-white-0 fill-white-0" />
                            </span>
                        </button>
                    </div>

                    <style jsx>{`
                        @keyframes bar-wave-full {
                            0% {
                                height: 15%;
                                opacity: 0.4;
                            }
                            50% {
                                height: 95%;
                                opacity: 1;
                            }
                            100% {
                                height: 35%;
                                opacity: 0.7;
                            }
                        }
                    `}</style>
                </div>
            )}
        </>
    );
}
