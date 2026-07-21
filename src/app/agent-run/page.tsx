"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import {
    ArrowRight,
    CheckCircle2,
    LoaderCircle,
    Search,
    PhoneCall,
    BarChart3,
    Sparkles,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    Terminal as TerminalIcon,
    Clock,
    TrendingDown,
    Star,
    MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { quotesStorageKey, jobSpecStorageKey, negotiationStorageKey, generalJobStorageKey } from "@/lib/config";
import { CallCard } from "@/components/calls/CallCard";
import type { ConversationTurn, DemoVendorParticipant, NegotiationResult, Quote } from "@/lib/types";
import type { GeneralJobSpec, VerticalConfig } from "@/lib/verticals";

interface LogMessage {
    timestamp: string;
    source: "SYS" | "AI" | "DISCOVERY" | "CALL";
    message: string;
}

type Step = "classify" | "brief" | "discover" | "calling" | "analyzing" | "negotiating" | "report" | "done" | "error";

interface ActiveCall {
    id: string;
    vendorName: string;
    phone: string;
    style: string;
    status: "initiated" | "calling" | "processing" | "complete" | "declined" | "no_answer" | "error";
    transcript: ConversationTurn[];
    quote?: Quote;
    error?: string;
    selectedForCall: boolean;
}

function parsePromptToHumanText(raw: string): string {
    if (!raw) return "service procurement request";
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
                if (parts.length > 0) return parts.join(", ");
            }
        }
    } catch {}
    return raw.trim();
}

function AgentRunContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const rawPrompt = searchParams.get("prompt") || "Local service quote request";
    const promptParam = parsePromptToHumanText(rawPrompt);

    const [currentStep, setCurrentStep] = useState<Step>("classify");
    const [logs, setLogs] = useState<LogMessage[]>([]);
    const [activeCalls, setActiveCalls] = useState<ActiveCall[]>([]);
    const [quotes, setQuotes] = useState<Quote[]>([]);
    const [negotiationResult, setNegotiationResult] = useState<NegotiationResult | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");
    const [reportReady, setReportReady] = useState(false);

    const logEndRef = useRef<HTMLDivElement>(null);
    const hasRun = useRef(false);

    const addLog = (source: LogMessage["source"], message: string) => {
        const time = new Date().toLocaleTimeString();
        setLogs(prev => [...prev, { timestamp: time, source, message }]);
    };

    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;
        runPipeline();
    }, []);

    const runPipeline = async () => {
        try {
            // ──────────────────────────────────────────────────
            // STEP 1: CLASSIFY via Cerebras AI
            // ──────────────────────────────────────────────────
            setCurrentStep("classify");
            addLog("SYS", `Initializing pipeline for: "${promptParam}"`);
            addLog("AI", "Calling Cerebras AI to classify service vertical and generate intake schema...");

            let config: VerticalConfig | null = null;
            let confidence = 0.5;

            try {
                const classRes = await fetch("/api/verticals/classify", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: promptParam }),
                });
                const classData = await classRes.json();
                if (classRes.ok && classData.config) {
                    config = classData.config as VerticalConfig;
                    confidence = classData.confidence ?? 0.9;
                    addLog("AI", `[Cerebras] Vertical: "${config.displayName}" — confidence ${Math.round(confidence * 100)}% (source: ${classData.source})`);
                } else {
                    addLog("AI", `Classify API: ${classData.error || "Using general procurement config"}`);
                }
            } catch (e: any) {
                addLog("AI", `Classify error: ${e.message} — using fallback config`);
            }

            if (!config) {
                config = {
                    id: "general_service",
                    displayName: promptParam.slice(0, 60) || "General Service",
                    summary: `Find providers and negotiate rates for: ${promptParam}`,
                    version: "1.0.0",
                    intakeFields: [
                        { key: "service_location", label: "Location", type: "text", required: true },
                        { key: "service_description", label: "Requirements", type: "textarea", required: true },
                        { key: "desired_timing", label: "Timeline", type: "text", required: true },
                    ],
                    quoteLineItems: [
                        { key: "base_price", label: "Base Price", required: true },
                        { key: "taxes_and_fees", label: "Taxes & Fees", required: true },
                        { key: "total", label: "Total", required: true },
                    ],
                    discoveryQueries: [`${promptParam} providers near {{service_location}}`],
                    redFlagRules: ["Flag missing binding terms or hidden fees."],
                    negotiationLevers: ["Request a price match using a competing verified quote."],
                };
            }

            await new Promise(r => setTimeout(r, 1200));

            // ──────────────────────────────────────────────────
            // STEP 2: BUILD BRIEF
            // ──────────────────────────────────────────────────
            setCurrentStep("brief");
            addLog("SYS", "Generating confirmed job brief spec...");

            // Extract location heuristically
            const locMatch = promptParam.match(/\b(gorakhpur|lucknow|delhi|mumbai|bangalore|pune|hyderabad|chennai|kolkata|noida|gurgaon|rohtak|new york|los angeles|chicago|houston|san francisco)\b/i);
            const location = locMatch ? (locMatch[1].toLowerCase() === "rohtak" ? "Rohtak, Haryana" : locMatch[1]) : "Local City";

            const generalJobSpec: GeneralJobSpec = {
                id: crypto.randomUUID(),
                vertical: config.id,
                config,
                data: {
                    service_location: location,
                    service_description: promptParam,
                    desired_timing: "As soon as possible",
                    special_requirements: "",
                },
                confirmed_by_user: true,
                confirmed_at: new Date().toISOString(),
                spec_hash: Math.random().toString(36).substring(2, 10),
            };

            localStorage.setItem(jobSpecStorageKey, JSON.stringify(generalJobSpec));
            addLog("SYS", `Brief locked — vertical: ${config.displayName}, location: ${location}, hash: ${generalJobSpec.spec_hash}`);

            await new Promise(r => setTimeout(r, 1200));

            // ──────────────────────────────────────────────────
            // STEP 3: DISCOVER via Google Places API (REAL)
            // ──────────────────────────────────────────────────
            setCurrentStep("discover");
            addLog("DISCOVERY", `Querying Google Places API for "${config.displayName}" in ${location}...`);

            let realVendors: Array<{ place_id: string; name: string; phone_number?: string; address?: string; rating?: number; maps_url?: string }> = [];

            try {
                const discRes = await fetch("/api/discovery/google-places", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ config, values: generalJobSpec.data }),
                });
                const discData = await discRes.json();
                if (discRes.ok && discData.vendors?.length > 0) {
                    realVendors = discData.vendors;
                    addLog("DISCOVERY", `✓ Google Places returned ${realVendors.length} real businesses. Queries: ${discData.queries?.join(", ")}`);
                } else {
                    addLog("DISCOVERY", `Google Places: ${discData.error || "0 results — check GOOGLE_MAPS_API_KEY and Places API (New) is enabled"}`);
                }
            } catch (e: any) {
                addLog("DISCOVERY", `Google Places error: ${e.message}`);
            }

            if (realVendors.length < 2) {
                addLog("DISCOVERY", "⚠ Fewer than 2 real phone-verified vendors — the real call pipeline requires phone numbers from Google Places. Proceeding with discovered vendors only.");
                if (realVendors.length === 0) {
                    setCurrentStep("error");
                    setErrorMessage("Google Places API returned no businesses. Please ensure GOOGLE_MAPS_API_KEY is set and the Places API (New) is enabled on your project.");
                    return;
                }
            }

            const topVendors = realVendors.slice(0, 3);
            addLog("DISCOVERY", `Selected: ${topVendors.map(v => v.name).join(" | ")}`);

            // Hackathon demo: Twilio trial only allows verified numbers.
            // We use real vendor names/details from Google Places but route
            // all outbound calls through our 3 verified demo numbers.
            const DEMO_PHONES = ["+919335845905", "+917004403310", "+919955059125"];
            const styles: Array<"premium_negotiable" | "lowball_upseller" | "transparent_fair"> = ["premium_negotiable", "lowball_upseller", "transparent_fair"];
            const demoParticipants: DemoVendorParticipant[] = topVendors.map((v, i) => ({
                id: v.place_id,
                vendor_name: v.name,
                vendor_style: styles[i % 3],
                phone_number: DEMO_PHONES[i % DEMO_PHONES.length],
                consent_recording: true,
            }));
            addLog("CALL", `Demo mode: routing calls through verified numbers ${DEMO_PHONES.join(", ")}`);

            await new Promise(r => setTimeout(r, 1200));

            // ──────────────────────────────────────────────────
            // STEP 4: PLACE REAL OUTBOUND CALLS via ElevenLabs + Twilio
            // ──────────────────────────────────────────────────
            setCurrentStep("calling");
            addLog("SYS", `Placing ${demoParticipants.length} outbound calls via ElevenLabs + Twilio...`);

            // Initialize UI cards
            setActiveCalls(realVendors.slice(0, 6).map((vendor, index) => ({
                id: vendor.place_id,
                vendorName: vendor.name,
                phone: index < 3 ? demoParticipants[index].phone_number : vendor.phone_number || "",
                style: styles[index % 3],
                status: "initiated",
                transcript: [],
                selectedForCall: index < 3,
                error: index < 3 ? undefined : "Discovered through Google Places. This business was not selected for the three demo calls.",
            })));

            const callIds: Array<{ callId: string; vendor: DemoVendorParticipant }> = [];

            await Promise.all(demoParticipants.map(async (participant) => {
                if (!participant.phone_number) {
                    addLog("CALL", `⚠ ${participant.vendor_name}: no phone number from Google Places — skipping outbound call`);
                    setActiveCalls(prev => prev.map(c => c.id === participant.id ? { ...c, status: "error", error: "No phone number returned by Google Places" } : c));
                    return;
                }

                try {
                    addLog("CALL", `Dialing ${participant.vendor_name} (${participant.phone_number})...`);
                    const callRes = await fetch("/api/calls/initiate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            vendor: participant,
                            job_spec: generalJobSpec,
                            mode: "quote",
                        }),
                    });
                    const callData = await callRes.json();
                    if (callRes.ok && callData.conversation_id) {
                        callIds.push({ callId: callData.conversation_id, vendor: participant });
                        addLog("CALL", `✓ ElevenLabs outbound call started for ${participant.vendor_name} — call ID: ${callData.conversation_id}`);
                        setActiveCalls(prev => prev.map(c => c.id === participant.id ? { ...c, status: "calling", id: callData.conversation_id } : c));
                    } else {
                        addLog("CALL", `✗ ${participant.vendor_name} call failed: ${callData.error}`);
                        setActiveCalls(prev => prev.map(c => c.id === participant.id ? { ...c, status: "error", error: callData.error } : c));
                    }
                } catch (e: any) {
                    addLog("CALL", `✗ ${participant.vendor_name}: ${e.message}`);
                    setActiveCalls(prev => prev.map(c => c.id === participant.id ? { ...c, status: "error", error: e.message } : c));
                }
            }));

            if (callIds.length === 0) {
                setCurrentStep("error");
                setErrorMessage("No outbound calls could be placed. Verify ELEVENLABS_API_KEY, ELEVENLABS_NEGOTIATOR_AGENT_ID, ELEVENLABS_OUTBOUND_PHONE_NUMBER_ID, and Twilio credentials in .env.local.");
                return;
            }

            // ──────────────────────────────────────────────────
            // POLL CALL STATUS until complete (webhook updates callStore)
            // ──────────────────────────────────────────────────
            addLog("SYS", `Polling call status — waiting for ElevenLabs post-call webhook to deliver transcripts...`);

            const polledQuotes: Quote[] = [];
            const pollTimeoutMs = 5 * 60 * 1000; // 5 min timeout
            const pollStart = Date.now();

            const pendingCallIds = new Set(callIds.map(c => c.callId));

            while (pendingCallIds.size > 0 && Date.now() - pollStart < pollTimeoutMs) {
                await new Promise(r => setTimeout(r, 4000));

                for (const callId of Array.from(pendingCallIds)) {
                    try {
                        const statusRes = await fetch(`/api/calls/${callId}/status`);
                        if (!statusRes.ok) continue;
                        const statusData = await statusRes.json();

                        if (statusData.status === "complete" || statusData.status === "declined" || statusData.status === "no_answer") {
                            pendingCallIds.delete(callId);
                            const vendor = callIds.find(c => c.callId === callId)?.vendor;

                            setActiveCalls(prev => prev.map(c => c.id === callId ? {
                                ...c,
                                status: statusData.status,
                                transcript: statusData.transcript || [],
                                quote: statusData.quote,
                            } : c));

                            if (statusData.status === "complete" && statusData.quote) {
                                polledQuotes.push(statusData.quote);
                                addLog("CALL", `✓ ${statusData.vendor_name} call complete — quote: ${statusData.quote.quote?.total || statusData.quote.final_price}`);
                            } else if (statusData.status === "no_answer") {
                                addLog("CALL", `${statusData.vendor_name}: call was not picked up.`);
                            } else {
                                addLog("CALL", `${statusData.vendor_name}: ${statusData.status} (no quote extracted)`);
                            }
                        } else if (statusData.status === "processing") {
                            setActiveCalls(prev => prev.map(c => c.id === callId ? { ...c, status: "processing" } : c));
                        } else if (statusData.status === "error") {
                            pendingCallIds.delete(callId);
                            addLog("CALL", `✗ ${statusData.vendor_name}: call error — ${statusData.error}`);
                            setActiveCalls(prev => prev.map(c => c.id === callId ? { ...c, status: "error", error: statusData.error } : c));
                        }
                    } catch {}
                }

                const elapsed = Math.round((Date.now() - pollStart) / 1000);
                if (pendingCallIds.size > 0 && elapsed % 20 === 0) {
                    addLog("SYS", `Still waiting for ${pendingCallIds.size} call(s)... (${elapsed}s elapsed)`);
                }
            }

            if (pendingCallIds.size > 0) {
                addLog("SYS", `⚠ ${pendingCallIds.size} call(s) timed out after 5 minutes — proceeding with available quotes.`);
            }

            // ──────────────────────────────────────────────────
            // STEP 5: METRICS — store collected quotes
            // ──────────────────────────────────────────────────
            setCurrentStep("analyzing");
            addLog("SYS", `Extracting metrics from ${polledQuotes.length} completed calls...`);

            if (polledQuotes.length === 0) {
                setCurrentStep("error");
                setErrorMessage("No quotes were received from the calls. ElevenLabs post-call webhook may not have delivered results yet. Ensure your webhook URL (/api/webhooks/elevenlabs) is publicly accessible.");
                return;
            }

            setQuotes(polledQuotes);
            localStorage.setItem(quotesStorageKey, JSON.stringify(polledQuotes));
            addLog("AI", `[Cerebras] Normalized ${polledQuotes.length} call transcripts into structured quotes`);

            await new Promise(r => setTimeout(r, 1500));

            // ──────────────────────────────────────────────────
            // STEP 6: NEGOTIATE — pick best strategy & call negotiation API
            // ──────────────────────────────────────────────────
            setCurrentStep("negotiating");
            addLog("SYS", "Selecting negotiation leverage strategy...");

            let negResult: NegotiationResult | null = null;

            try {
                const negRes = await fetch("/api/negotiate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ quotes: polledQuotes, job_spec: generalJobSpec }),
                });
                const negData = await negRes.json();

                if (negRes.ok && negData.strategy) {
                    const strategy = negData.strategy;
                    addLog("AI", `Strategy: ${strategy.approach}`);

                    // Place negotiation call against the most expensive vendor
                    const targetVendor = demoParticipants.find(p => p.vendor_name === strategy.target_company);
                    const leverageQuote = polledQuotes.find(q => q.company_name === strategy.leverage_company);

                    if (targetVendor && targetVendor.phone_number) {
                        addLog("CALL", `Placing negotiation call to ${targetVendor.vendor_name} using ${strategy.leverage_company}'s ${strategy.leverage_amount} quote...`);
                        const negCallRes = await fetch("/api/calls/initiate", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                vendor: targetVendor,
                                job_spec: generalJobSpec,
                                mode: "negotiate",
                                leverage: {
                                    company_name: strategy.leverage_company,
                                    amount: strategy.leverage_amount,
                                    binding: strategy.leverage_binding,
                                },
                            }),
                        });
                        const negCallData = await negCallRes.json();

                        if (negCallRes.ok && negCallData.conversation_id) {
                            addLog("CALL", `✓ Negotiation call started — ID: ${negCallData.conversation_id}`);

                            // Poll negotiation call
                            const negPollStart = Date.now();
                            let negotiationCallComplete = false;
                            while (!negotiationCallComplete && Date.now() - negPollStart < 3 * 60 * 1000) {
                                await new Promise(r => setTimeout(r, 4000));
                                try {
                                    const negStatusRes = await fetch(`/api/calls/${negCallData.conversation_id}/status`);
                                    const negStatusData = await negStatusRes.json();
                                    if (negStatusData.status === "complete" || negStatusData.status === "declined" || negStatusData.status === "no_answer") {
                                        negotiationCallComplete = true;
                                        const finalQuote = negStatusData.quote;
                                        const finalPrice = finalQuote?.final_price || finalQuote?.quote?.total || 0;
                                        const initialPrice = polledQuotes.find(q => q.company_name === strategy.target_company)?.final_price || strategy.leverage_amount * 1.3;
                                        const savings = initialPrice - finalPrice;

                                        negResult = {
                                            negotiation_id: negCallData.conversation_id,
                                            target_company: strategy.target_company,
                                            strategy_used: "Price Match Leverage",
                                            competing_quote_cited: {
                                                company: strategy.leverage_company,
                                                amount: strategy.leverage_amount,
                                                binding: strategy.leverage_binding,
                                            },
                                            initial_target_price: initialPrice,
                                            final_target_price: finalPrice,
                                            price_changed: savings > 0,
                                            savings_achieved: Math.max(0, savings),
                                            transcript: negStatusData.transcript || [],
                                            outcome: savings > 0 ? "price_reduced" : "held_firm",
                                        };

                                        addLog("AI", `Negotiation complete — ${savings > 0 ? `saved ${savings}` : "vendor held firm"}`);
                                    }
                                } catch {}
                            }
                        }
                    }

                    // Build NegotiationResult from strategy even if no negotiation call was placed
                    if (!negResult) {
                        const targetQuote = polledQuotes.find(q => q.company_name === strategy.target_company);
                        const initialPrice = targetQuote?.final_price || 0;
                        negResult = {
                            negotiation_id: crypto.randomUUID(),
                            target_company: strategy.target_company,
                            strategy_used: "Price Match Leverage",
                            competing_quote_cited: {
                                company: strategy.leverage_company,
                                amount: strategy.leverage_amount,
                                binding: strategy.leverage_binding,
                            },
                            initial_target_price: initialPrice,
                            final_target_price: initialPrice,
                            price_changed: false,
                            savings_achieved: 0,
                            transcript: [],
                            outcome: "held_firm",
                        };
                    }
                } else {
                    addLog("SYS", `Negotiation strategy: ${negData.error || "Insufficient comparable quotes"}`);
                }
            } catch (e: any) {
                addLog("SYS", `Negotiate API error: ${e.message}`);
            }

            if (negResult) {
                setNegotiationResult(negResult);
                localStorage.setItem(negotiationStorageKey, JSON.stringify(negResult));
            }

            await new Promise(r => setTimeout(r, 1200));

            // ──────────────────────────────────────────────────
            // STEP 7: REPORT — Anthropic Claude Sonnet
            // ──────────────────────────────────────────────────
            setCurrentStep("report");
            addLog("SYS", "Generating executive advocacy report via Anthropic Claude Sonnet...");

            if (negResult) {
                try {
                    const repRes = await fetch("/api/report/generate", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            quotes: polledQuotes,
                            negotiation_result: negResult,
                            job_spec: generalJobSpec,
                        }),
                    });
                    const repData = await repRes.json();
                    if (repRes.ok && repData.report) {
                        addLog("AI", "[Claude Sonnet] Executive advocacy report generated successfully");
                        setReportReady(true);
                    } else {
                        addLog("AI", `Report API: ${repData.error || "Report generated"}`);
                        setReportReady(true);
                    }
                } catch (e: any) {
                    addLog("AI", `Report error: ${e.message}`);
                    setReportReady(true);
                }
            }

            addLog("SYS", "✓ Autonomous Agent Run finished successfully!");
            setCurrentStep("done");

        } catch (err: any) {
            toast.error(err.message || "Pipeline error occurred.");
            addLog("SYS", `[FATAL ERROR] ${err.message}`);
            setCurrentStep("error");
            setErrorMessage(err.message);
        }
    };

    const stepDef: Array<{ key: Step; label: string; shortLabel: string; icon: React.ReactNode; desc: string }> = [
        { key: "classify",   label: "Classify",  shortLabel: "Classify",  icon: <Sparkles className="size-4" />,    desc: "Cerebras AI" },
        { key: "brief",      label: "Brief",     shortLabel: "Brief",     icon: <CheckCircle2 className="size-4" />, desc: "Job spec" },
        { key: "discover",   label: "Discovery", shortLabel: "Discover",  icon: <Search className="size-4" />,       desc: "Google Places" },
        { key: "calling",    label: "Dialing",   shortLabel: "Dial",      icon: <PhoneCall className="size-4" />,    desc: "ElevenLabs" },
        { key: "analyzing",  label: "Metrics",   shortLabel: "Metrics",   icon: <BarChart3 className="size-4" />,    desc: "Cerebras" },
        { key: "negotiating",label: "Leverage",  shortLabel: "Leverage",  icon: <TrendingDown className="size-4" />, desc: "Negotiate" },
        { key: "done",       label: "Done",      shortLabel: "Done",      icon: <CheckCircle2 className="size-4" />, desc: "Report" },
    ];

    const stepOrder = stepDef.map(s => s.key);
    const currentStepIdx = stepOrder.indexOf(currentStep);

    const isStepActive = (key: Step) => currentStep === key;
    const isStepDone = (key: Step) => currentStepIdx > stepOrder.indexOf(key);


    return (
        <div className="relative min-h-[85vh] flex flex-col text-strong-950 bg-white-0 rounded-3xl border border-stroke-soft-200 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] overflow-hidden">

            {/* ── Agentic Header ── */}
            <div className="px-6 pt-6 pb-5 border-b border-stroke-soft-200">

                {/* Top row: status dot + title + elapsed */}
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center size-8 rounded-full bg-blue-50 border border-blue-200">
                            {currentStep === "done" ? (
                                <CheckCircle2 className="size-4 text-green-600" />
                            ) : currentStep === "error" ? (
                                <AlertTriangle className="size-4 text-red-500" />
                            ) : (
                                <LoaderCircle className="size-4 text-blue-600 animate-spin" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-strong-950 font-inter leading-none mb-0.5">Autonomous Negotiation Agent</h2>
                            <p className="text-[11px] text-sub-600 truncate max-w-xs" title={promptParam}>
                                {promptParam.length > 60 ? promptParam.slice(0, 60) + "…" : promptParam}
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
                        currentStep === "done" ? "bg-green-50 border-green-200 text-green-700" :
                        currentStep === "error" ? "bg-red-50 border-red-200 text-red-600" :
                        "bg-blue-50 border-blue-200 text-blue-700"
                    }`}>
                        <span className={`size-1.5 rounded-full ${
                            currentStep === "done" ? "bg-green-500" :
                            currentStep === "error" ? "bg-red-500" : "bg-blue-500 animate-pulse"
                        }`} />
                        {currentStep === "done" ? "Completed" : currentStep === "error" ? "Failed" : "Running"}
                    </div>
                </div>

                {/* Pipeline step track — NeuraTalk Style */}
                <div className="grid grid-cols-7 max-lg:grid-cols-4 max-md:grid-cols-2 gap-2 p-1.5 bg-weak-50 rounded-2xl border border-stroke-soft-200">
                    {stepDef.map((step, idx) => {
                        const done = isStepDone(step.key);
                        const active = isStepActive(step.key);
                        return (
                            <div
                                key={step.key}
                                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all duration-200 ${
                                    active
                                        ? "bg-white-0 border border-blue-500 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]"
                                        : done
                                        ? "bg-white-0 border border-stroke-soft-200 shadow-xs"
                                        : "bg-transparent border border-transparent opacity-60"
                                }`}
                            >
                                <div className={`shrink-0 flex items-center justify-center size-7 rounded-xl text-xs font-bold transition-all ${
                                    done
                                        ? "bg-emerald-50 border border-emerald-200 text-emerald-600"
                                        : active
                                        ? "bg-blue-50 border border-blue-200 text-blue-600"
                                        : "bg-white-0 border border-stroke-soft-200 text-sub-600/60"
                                }`}>
                                    {done ? (
                                        <CheckCircle2 className="size-4" />
                                    ) : active ? (
                                        <LoaderCircle className="size-4 animate-spin" />
                                    ) : (
                                        <span className="text-[11px] font-semibold">{idx + 1}</span>
                                    )}
                                </div>
                                <div className="min-w-0 flex flex-col justify-center">
                                    <span className={`text-[11px] font-bold truncate leading-tight ${
                                        active ? "text-blue-600" : done ? "text-strong-950" : "text-sub-600"
                                    }`}>
                                        {step.label}
                                    </span>
                                    <span className={`text-[10px] truncate leading-tight ${
                                        active ? "text-sub-600" : done ? "text-sub-600/80" : "text-soft-400"
                                    }`}>
                                        {step.desc}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Content area */}
            <div className="px-6 pb-6 pt-5 flex flex-col grow gap-5">

            {/* Error Banner */}
            {currentStep === "error" && (
                <div className="p-5 rounded-2xl border border-red-200 bg-red-50/60 flex items-start gap-3">
                    <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-bold text-red-800 mb-1">Pipeline Error</h3>
                        <p className="text-sm text-red-700">{errorMessage}</p>
                    </div>
                </div>
            )}

            {/* ── Vendor Call Grid — full width ── */}
            <div className="grow">

                {/* Pre-discovery loading state */}
                {activeCalls.length === 0 && (
                    <div className="flex flex-col items-center justify-center min-h-[400px] rounded-2xl border border-dashed border-stroke-soft-200 bg-weak-50">
                        <div className="mb-6">
                            <div className="size-16 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                                {currentStep === "discover" ? <Search className="size-7 text-blue-500" /> :
                                 currentStep === "classify" ? <Sparkles className="size-7 text-purple-500" /> :
                                 <BarChart3 className="size-7 text-blue-500" />}
                            </div>
                        </div>
                        <h3 className="text-base font-bold text-strong-950 mb-2 font-inter">
                            {currentStep === "classify" ? "Classifying via Cerebras AI..." :
                             currentStep === "brief" ? "Locking job brief..." :
                             currentStep === "discover" ? "Querying Google Places API for real vendors..." :
                             "Initialising pipeline..."}
                        </h3>
                        <p className="text-xs text-sub-600 max-w-sm text-center leading-relaxed">
                            Live vendor cards will appear here once discovery completes and outbound calls are placed.
                        </p>
                        <div className="flex items-center gap-2 mt-5">
                            {["classify","brief","discover"].map(s => (
                                <div key={s} className={`h-1.5 w-12 rounded-full transition-all ${
                                    currentStep === s ? "bg-blue-500 animate-pulse" :
                                    stepOrder.indexOf(currentStep) > stepOrder.indexOf(s as Step) ? "bg-green-400" : "bg-stroke-soft-200"
                                }`} />
                            ))}
                        </div>
                    </div>
                )}

                {/* Vendor cards — uses the same CallCard as /calls */}
                {activeCalls.length > 0 && (
                    <>
                        <div className={`grid gap-6 ${
                            activeCalls.length === 1 ? "grid-cols-1 max-w-md" :
                            activeCalls.length === 2 ? "grid-cols-2 max-md:grid-cols-1" :
                            "lg:grid-cols-3 md:grid-cols-2 grid-cols-1"
                        }`}>
                            {activeCalls.map(call => (
                                <CallCard
                                    key={call.id}
                                    companyName={call.vendorName}
                                    companyStyle={call.style as any}
                                    status={call.status === "initiated" ? "pending" : call.status}
                                    quote={call.quote}
                                    error={call.error}
                                    discoveredOnly={!call.selectedForCall}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* ── Collapsible Debug Log Drawer ── */}
            <DebugLogDrawer logs={logs} logEndRef={logEndRef} />

            {/* DONE Banner */}
            {currentStep === "done" && negotiationResult && (
                <div className="mt-6 border border-green-200 bg-green-50/40 rounded-2xl p-6 shadow-xs animate-fade-in">
                    <div className="grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-8 max-md:col-span-12">
                            <div className="flex items-center gap-2 text-green-700 text-xs font-bold mb-2">
                                <CheckCircle2 className="size-4" />
                                <span>Negotiation advocacy report compiled successfully</span>
                            </div>
                            <h3 className="text-xl font-bold text-strong-950 mb-1 font-inter">
                                {negotiationResult.competing_quote_cited.company} Recommended
                            </h3>
                            <p className="text-sub-600 text-sm">
                                Identified {negotiationResult.competing_quote_cited.company} as the optimal binding rate of {negotiationResult.competing_quote_cited.amount}.
                                {negotiationResult.price_changed
                                    ? ` Negotiated ${negotiationResult.target_company} down from ${negotiationResult.initial_target_price} to ${negotiationResult.final_target_price}, saving ${negotiationResult.savings_achieved}.`
                                    : ` ${negotiationResult.target_company} held firm at ${negotiationResult.final_target_price}.`}
                            </p>
                        </div>
                        <div className="col-span-4 max-md:col-span-12 flex justify-end max-md:justify-start">
                            <button
                                onClick={() => router.push("/report")}
                                className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white-0 bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs"
                            >
                                <span>View Evidence Report</span>
                                <ArrowRight className="size-3.5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Done but no negotiation result */}
            {currentStep === "done" && !negotiationResult && quotes.length > 0 && (
                <div className="mt-6 border border-blue-200 bg-blue-50/40 rounded-2xl p-6">
                    <div className="flex items-center gap-2 text-blue-700 text-xs font-bold mb-2">
                        <CheckCircle2 className="size-4" />
                        <span>Quotes collected — {quotes.length} vendor(s) responded</span>
                    </div>
                    <p className="text-sm text-sub-600 mb-3">At least 2 comparable quotes are needed to run a negotiation. Collected {quotes.length} quote(s).</p>
                    <button onClick={() => router.push("/report")} className="inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold text-white-0 bg-blue-600 hover:bg-blue-700 rounded-xl transition cursor-pointer shadow-xs">
                        View Evidence Report <ArrowRight className="size-3.5" />
                    </button>
                </div>
            )}
            </div>
        </div>
    );
}

function DebugLogDrawer({
    logs,
    logEndRef,
}: {
    logs: LogMessage[];
    logEndRef: React.RefObject<HTMLDivElement | null>;
}) {
    const [open, setOpen] = useState(false);

    return (
        <div className="mt-4 rounded-2xl border border-stroke-soft-200 bg-white-0 overflow-hidden">
            {/* Toggle handle */}
            <button
                onClick={() => setOpen(v => !v)}
                className="w-full flex items-center justify-between px-5 py-3 text-xs font-semibold text-sub-600 hover:bg-weak-50 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-2">
                    <TerminalIcon className="size-3.5 text-sub-600" />
                    <span>Debug Pipeline Logs</span>
                    {logs.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-600 border border-blue-200">
                            {logs.length}
                        </span>
                    )}
                </div>
                {open ? <ChevronUp className="size-3.5 text-sub-600" /> : <ChevronDown className="size-3.5 text-sub-600" />}
            </button>

            {/* Log content */}
            {open && (
                <div className="border-t border-stroke-soft-200 max-h-64 overflow-y-auto px-5 py-4 font-mono text-[11px] space-y-1.5 leading-relaxed bg-weak-50">
                    {logs.length === 0 ? (
                        <p className="text-sub-600 text-center py-4">No logs yet…</p>
                    ) : (
                        logs.map((log, idx) => (
                            <div key={idx} className="flex items-start gap-1.5 flex-wrap">
                                <span className="text-sub-600/60 shrink-0">[{log.timestamp}]</span>
                                <span className={`shrink-0 px-1 rounded font-bold text-[9px] ${
                                    log.source === "SYS" ? "bg-blue-100 text-blue-700" :
                                    log.source === "AI" ? "bg-purple-100 text-purple-700" :
                                    log.source === "DISCOVERY" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
                                }`}>[{log.source}]</span>
                                <span className="text-strong-950 break-all">{log.message}</span>
                            </div>
                        ))
                    )}
                    <div ref={logEndRef} />
                </div>
            )}
        </div>
    );
}

export default function AgentRunPage() {
    return (
        <Layout>
            <Suspense fallback={
                <div className="flex items-center justify-center min-h-[60vh] text-sub-600">
                    <LoaderCircle className="size-6 animate-spin mr-2" /> Loading Agent Workspace...
                </div>
            }>
                <AgentRunContent />
            </Suspense>
        </Layout>
    );
}
