"use client";

import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Image from "@/components/Image";
import PanelMessage from "@/components/PanelMessage";
import { items } from "./items";

const HomePage = () => {
    const [request, setRequest] = useState("");
    const [stage, setStage] = useState(-1);
    useEffect(() => {
        if (stage < 0 || stage > 3) return;
        const timer = window.setTimeout(() => setStage((value) => value + 1), 1500);
        return () => window.clearTimeout(timer);
    }, [stage]);
    return (
        <Layout>
            <div className="chat-wrapper">
                <div className="-mb-3 pt-18 px-7.5 pb-12 grow overflow-auto scrollbar-none max-md:pt-4 max-md:px-4 max-md:pb-8">
                    <div className="mb-12 text-center max-md:mb-6">
                        <Image
                            className="w-21 mb-3 opacity-100"
                            src="/images/ai-voice.png"
                            width={84}
                            height={85}
                            alt="AI Voice"
                        />
                        <div className="mb-3 text-h3 max-md:mb-1.5 max-md:text-[1.6rem]">
                            Welcome to The Negotiator
                        </div>
                        <div className="max-w-120 mx-auto text-p-xl text-sub-600 max-md:text-p-sm">
                            Tell your agent what you need. It creates the brief,
                            searches the market, calls approved vendors, and compares the evidence.
                        </div>
                    </div>
                    {stage >= 0 && <div className="max-w-150 mx-auto border border-stroke-soft-200 rounded-xl overflow-hidden"><div className="p-4 bg-weak-50 text-label-sm">Request: {request}</div>{items.slice(0, 4).map((item, index) => <div className="flex items-center gap-3 p-4 border-t border-stroke-soft-200" key={item.id}><div className={`flex justify-center items-center size-8 rounded-full ${stage > index ? "bg-success-base text-white-0" : stage === index ? "bg-blue-100 text-blue-600" : "bg-weak-50 text-soft-400"}`}>{stage > index ? "✓" : index + 1}</div><div><div className="text-label-sm">{item.title}</div><div className="text-soft-400">{stage > index ? "Complete" : stage === index ? "Working now" : "Queued"}</div></div></div>)}</div>}
                </div>
                <PanelMessage onSend={(value) => { setRequest(value); setStage(0); }} />
            </div>
            <section className="py-18 max-md:py-12">
                <div className="max-w-[1200px] mx-auto">
                    <div className="text-center mb-10">
                        <div className="text-sub-sm text-blue-500">HOW THE NEGOTIATOR WORKS</div>
                        <h2 className="mt-2 text-h3 max-md:text-[1.8rem]">One request. A complete, evidence-backed decision.</h2>
                        <p className="max-w-110 mx-auto mt-3 text-p-lg text-sub-600 max-md:text-p-sm">Your agent handles the repetitive work while keeping every step visible and every quote comparable.</p>
                    </div>
                    <div className="grid grid-cols-4 gap-4 max-md:grid-cols-1">
                        {[
                            ['01', 'Tell the agent', 'Describe what you need, where, and when.'],
                            ['02', 'Build the brief', 'The agent creates one consistent scope and JSON request.'],
                            ['03', 'Search and call', 'It finds relevant vendors and collects comparable quotes.'],
                            ['04', 'Choose with proof', 'Review price, scope, fees, and the recommended next move.'],
                        ].map(([number, title, description]) => <article key={number} className="rounded-xl border border-stroke-soft-200 bg-white-0 p-5"><div className="text-sub-sm text-blue-500">{number}</div><h3 className="mt-5 text-label-lg">{title}</h3><p className="mt-2 text-p-sm text-sub-600">{description}</p></article>)}
                    </div>
                    <div className="mt-6 rounded-xl border border-success-light bg-success-lighter px-5 py-4 text-p-sm text-success-dark">The agent discloses it is AI, uses only verified evidence, and never books a vendor or invents a competing quote.</div>
                </div>
            </section>
        </Layout>
    );
};

export default HomePage;
