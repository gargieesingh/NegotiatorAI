"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "@/components/Layout";
import InlineVoicePrompt from "@/components/InlineVoicePrompt";
import Item from "./Item";
import { items } from "./items";
import { Sparkles, FileText, Send, Mic } from "lucide-react";
import { toast } from "sonner";

const HomePage = () => {
    const router = useRouter();
    const [prompt, setPrompt] = useState("");
    const [fileUploaded, setFileUploaded] = useState<File | null>(null);
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (prompt.trim().length < 5) {
            toast.error("Please describe your request in a bit more detail.");
            return;
        }

        localStorage.setItem("negotiator_agent_initial_prompt", prompt.trim());
        if (fileUploaded) {
            localStorage.setItem("negotiator_agent_uploaded_file", fileUploaded.name);
        } else {
            localStorage.removeItem("negotiator_agent_uploaded_file");
        }

        toast.success("Initializing Autonomous Negotiation Agent...");
        router.push(`/agent-run?prompt=${encodeURIComponent(prompt.trim())}`);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFileUploaded(e.target.files[0]);
            toast.success(`Attached quote document: ${e.target.files[0].name}`);
        }
    };

    return (
        <Layout>
            <div className="chat-wrapper">
                <div className="-mb-3 pt-12 px-7.5 pb-12 grow overflow-auto scrollbar-none max-md:pt-4 max-md:px-4 max-md:pb-8">
                    
                    {/* Hero Header */}
                    <div className="mb-8 text-center max-md:mb-6">
                        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-weak-50 border border-stroke-soft-200 text-xs text-sub-600 font-semibold mb-4">
                            <Sparkles className="size-3.5 text-blue-500" />
                            <span>AI-Powered Procurement & Price Negotiation Agent</span>
                        </div>
                        <h1 className="text-h3 font-bold text-strong-950 mb-3 max-md:text-[1.6rem]">
                            Delegate your vendor outreach & negotiations to AI
                        </h1>
                        <p className="max-w-xl mx-auto text-p-lg text-sub-600 max-md:text-p-sm">
                            Describe your scope or attach an existing quote. Our AI agent discovers local providers, places live calls, and negotiates terms autonomously.
                        </p>
                    </div>

                    {/* Central Prompt Form / Inline Voice Assistant */}
                    <div className="max-w-2xl mx-auto mb-10">
                        <InlineVoicePrompt
                            prompt={prompt}
                            setPrompt={setPrompt}
                            fileUploaded={fileUploaded}
                            onFileChange={handleFileChange}
                            onSubmitText={handleSubmit}
                        />
                    </div>

                    {/* Workflow Module Cards */}
                    <div className="flex flex-wrap -mt-3 -mx-1.5">
                        {items.map((item) => (
                            <Item item={item} key={item.id} />
                        ))}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default HomePage;
