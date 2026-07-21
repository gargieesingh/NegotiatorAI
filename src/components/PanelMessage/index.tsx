import { useState } from "react";

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
        <div className="relative flex min-h-72 flex-col items-center justify-center px-6 py-8 text-center bg-white-0 border border-stroke-soft-200 rounded-3xl shadow-sm">
            <div className={`absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_210deg,#ebf1ff,#f2f5f8,#f9fafc,#ebf1ff)] blur-3xl opacity-70 ${voiceState !== "idle" ? "animate-pulse" : ""}`} />
            <button onClick={startVoiceAgent} aria-label="Start speaking with Nia" className={`relative flex size-50 items-center justify-center rounded-full transition-transform hover:scale-105 ${voiceState !== "idle" ? "animate-pulse" : ""}`}>
                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_206deg,#335cff,#7d52f4,#47c2ff,#335cff,#7d52f4)] opacity-30 blur-[10px]" />
                <span className="absolute inset-0 rounded-full bg-[conic-gradient(from_206deg,#335cff,#7d52f4,#47c2ff,#335cff,#7d52f4)] opacity-60 blur-[2.5px]" />
                <span className="absolute inset-1 rounded-full bg-[radial-gradient(32%_48%_at_39%_50%,rgba(125,82,244,.15),transparent),radial-gradient(30%_30%_at_67%_97%,rgba(71,194,255,.3),transparent),radial-gradient(39%_39%_at_97%_34%,rgba(51,92,255,.25),transparent),radial-gradient(52%_44%_at_29%_7%,rgba(180,210,255,.4),transparent),#ffffff] border border-stroke-soft-200 shadow-[inset_0_0_12px_#ebf1ff,inset_0_0_30px_#c0d5ff]" />
                <span className="absolute inset-4 rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(51,92,255,.1),transparent_65%)]" />
                <span className={`relative z-10 h-1.5 w-22 rounded-full bg-[linear-gradient(90deg,transparent,#335cff_18%,#47c2ff_50%,#335cff_82%,transparent)] shadow-[0_0_14px_#335cff] ${voiceState === "speaking" ? "animate-pulse" : ""}`} />
            </button>
            <div className="mt-6 text-label-lg text-strong-950 font-medium">Nia, your Negotiator</div>
            <div className="mt-2 text-p-sm text-sub-600">{voiceState === "idle" ? "Tap the wave to start talking" : voiceState === "speaking" ? "Nia is speaking…" : "Listening — tell Nia what you need"}</div>
        </div>
    </div>;
};

export default PanelMessage;
