'use client';

import { useConversation } from '@11labs/react';
import { Mic, Square, Loader2, CheckCircle2, Radio } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { VerticalConfig } from '@/lib/verticals';

interface GenericVoiceIntakeProps {
  config: VerticalConfig;
  onSpecReceived: (values: Record<string, string | number | boolean>) => void;
}

interface TranscriptLine {
  speaker: 'agent' | 'user';
  text: string;
}

function toValues(candidate: unknown, config: VerticalConfig): Record<string, string | number | boolean> | null {
  const source = typeof candidate === 'string' ? (() => { try { return JSON.parse(candidate); } catch { return null; } })() : candidate;
  if (typeof source !== 'object' || source === null) return null;
  const object = source as Record<string, unknown>;
  if (typeof object.job_spec_json === 'string') return toValues(object.job_spec_json, config);
  const data = typeof object.data === 'object' && object.data !== null ? object.data as Record<string, unknown> : object;
  const result: Record<string, string | number | boolean> = {};
  for (const field of config.intakeFields) {
    const value = data[field.key];
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') result[field.key] = value;
  }
  return Object.keys(result).length ? result : null;
}

const BAR_COUNT = 24;

export function GenericVoiceIntake({ config, onSpecReceived }: GenericVoiceIntakeProps) {
  const [transcript, setTranscript] = useState<TranscriptLine[]>([]);
  const [briefReceived, setBriefReceived] = useState(false);
  const delivered = useRef(false);
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID;

  const accept = (candidate: unknown) => {
    const values = toValues(candidate, config);
    if (!values) return 'The brief could not be saved because the configured fields were missing. Ask the customer the missing questions.';
    if (!delivered.current) {
      delivered.current = true;
      setBriefReceived(true);
      onSpecReceived(values);
      toast.success('Voice brief captured — review and confirm below.');
    }
    return 'The brief is saved. Thank the customer, explain that the next step is vendor discovery, and end the call. Do not read JSON or field names aloud.';
  };

  const conversation = useConversation({
    clientTools: { submit_job_spec: accept },
    onConnect: () => toast.success('Voice estimator connected. Describe your request.'),
    onDisconnect: () => toast.message('Voice conversation ended.'),
    onError: (error) => toast.error(`Voice connection failed: ${String(error)}`),
    onMessage: (event: unknown) => {
      const ev = event as { message?: string; source?: string } | null;
      const message = typeof ev?.message === 'string' ? ev.message : '';
      if (!message) return;
      const speaker: TranscriptLine['speaker'] = ev?.source === 'user' ? 'user' : 'agent';
      setTranscript((prev) => [...prev.slice(-8), { speaker, text: message }]);
      if (message.includes('{')) accept(message.slice(message.indexOf('{'), message.lastIndexOf('}') + 1));
    },
  });

  const active = conversation.status === 'connected';

  const start = async () => {
    if (!agentId) { toast.error('Set NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID to enable voice intake.'); return; }
    try {
      delivered.current = false;
      setTranscript([]);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId,
        dynamicVariables: {
          vertical_config: JSON.stringify(config),
          intake_fields: config.intakeFields.map((f) => f.key).join(', '),
        },
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not start voice intake.');
    }
  };

  const stop = () => void conversation.endSession();

  return (
    <section className="rounded-2xl border border-stroke-soft-200 bg-white-0 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header row */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stroke-soft-200">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-blue-600">Voice Interview</p>
          <h2 className="mt-0.5 text-base font-semibold text-strong-950">
            Talk through your {config.displayName.toLowerCase()} request
          </h2>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider transition-colors ${
          briefReceived
            ? 'border-green-200 bg-green-50 text-green-700'
            : active
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'border-stroke-soft-200 bg-weak-50 text-sub-600'
        }`}>
          <span className={`size-1.5 rounded-full ${briefReceived ? 'bg-green-500' : active ? 'bg-blue-500' : 'bg-soft-400'}`} />
          {briefReceived ? 'Brief captured' : active ? 'Listening' : 'Ready'}
        </span>
      </div>

      {/* Waveform + mic button */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-4">
          {/* Mic button */}
          <button
            onClick={active ? stop : () => void start()}
            disabled={briefReceived}
            className={`relative flex-shrink-0 size-12 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
              briefReceived
                ? 'border-green-300 bg-green-50 text-green-600 cursor-default'
                : active
                ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
                : 'border-stroke-soft-200 bg-weak-50 text-strong-950 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
            }`}
          >
            {briefReceived ? (
              <CheckCircle2 size={18} />
            ) : active ? (
              <Square size={15} fill="currentColor" />
            ) : (
              <Mic size={18} />
            )}
          </button>

          {/* Waveform bars */}
          <div className="flex items-center gap-[2px] h-8 flex-1">
            {Array.from({ length: BAR_COUNT }).map((_, i) => (
              <div
                key={i}
                className={`w-[3px] rounded-full transition-all ${
                  briefReceived
                    ? 'bg-green-400'
                    : active
                    ? 'bg-blue-500'
                    : 'bg-stroke-soft-200'
                }`}
                style={{
                  height: active
                    ? `${28 + Math.sin(i * 0.9 + Date.now() / 200) * 14}%`
                    : briefReceived
                    ? `${40 + Math.sin(i * 0.5) * 20}%`
                    : `${20 + Math.sin(i * 0.5) * 10}%`,
                  animation: active ? `none` : 'none',
                  transform: active ? `scaleY(${0.4 + Math.random() * 0.8})` : 'none',
                }}
              />
            ))}
          </div>

          {/* State label */}
          <p className="text-xs font-semibold text-sub-600 whitespace-nowrap w-24 text-right">
            {briefReceived
              ? 'Brief ready ✓'
              : active
              ? 'Listening live...'
              : 'Click mic to start'}
          </p>
        </div>

        {/* Hint text */}
        {!active && !briefReceived && (
          <p className="mt-3 text-xs text-sub-600 leading-relaxed">
            The AI estimator will ask you questions about your {config.displayName.toLowerCase()} request. You confirm every value before any vendor is contacted.
          </p>
        )}
      </div>

      {/* Transcript */}
      {transcript.length > 0 && (
        <div className="border-t border-stroke-soft-200 px-6 py-4 space-y-2 max-h-48 overflow-y-auto scrollbar-none">
          {transcript.map((line, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${line.speaker === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {line.speaker === 'agent' && (
                <div className="flex-shrink-0 size-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
                  <Radio size={10} className="text-blue-600" />
                </div>
              )}
              <p className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                line.speaker === 'agent'
                  ? 'bg-weak-50 border border-stroke-soft-200 text-strong-950'
                  : 'bg-blue-600 text-white-0'
              }`}>
                {line.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
