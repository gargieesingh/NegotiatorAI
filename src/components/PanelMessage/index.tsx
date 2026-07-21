import { useState } from "react";
import Icon from "@/components/Icon";
import { AgentAudioVisualizerWave } from "@/components/agent-audio-visualizer-wave";

const PanelMessage = () => {
    const [voiceState, setVoiceState] = useState<"idle" | "speaking" | "listening">("idle");
    const startVoiceAgent = () => {
        setVoiceState("speaking");
        try {
            window.speechSynthesis.cancel();
            const voice = new SpeechSynthesisUtterance("Hi, I am Nia, your Negotiator. What would you like help pricing or negotiating today?");
            voice.onend = () => setVoiceState("listening");
            window.speechSynthesis.speak(voice);
        } catch { setTimeout(() => setVoiceState("listening"), 1800); }
    };

    return <div className="relative z-3 mx-7.5 mb-5.5 shrink-0 overflow-visible max-md:m-0">
        <div className="relative flex min-h-72 flex-col items-center justify-center px-6 py-8 text-center">
            <div className={`absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_210deg,#dff9f0,#dce9ff,#f5e2ff,#dff9f0)] blur-3xl opacity-70 ${voiceState !== "idle" ? "animate-pulse" : ""}`} />
            <button onClick={startVoiceAgent} aria-label="Start speaking with Nia" className={`relative flex size-36 items-center justify-center rounded-full border border-white/80 bg-white/60 shadow-[0_12px_40px_rgba(118,150,220,.17)] transition-transform hover:scale-105 ${voiceState !== "idle" ? "animate-pulse" : ""}`}>
                <AgentAudioVisualizerWave size="lg" state={voiceState === "idle" ? "connecting" : voiceState} color="#7b8df5" className="w-25" />
            </button>
            <div className="mt-6 text-label-lg text-strong-950">Nia, your Negotiator</div>
            <div className="mt-2 text-p-sm text-sub-600">{voiceState === "idle" ? "Tap the wave to start talking" : voiceState === "speaking" ? "Nia is speaking…" : "Listening — tell Nia what you need"}</div>
        </div>
    </div>;
};

export default PanelMessage;
