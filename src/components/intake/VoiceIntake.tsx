'use client';

import { useConversation } from '@11labs/react';
import { Mic, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { JobSpec } from '@/lib/types';

interface VoiceIntakeProps {
  onSpecReceived: (spec: Partial<JobSpec>) => void;
}

function extractJobSpec(text: string): Partial<JobSpec> | null {
  const tagged = text.match(/<WEDDING_PHOTO_JOB_SPEC[^>]*>\s*([\s\S]*?)\s*<\/WEDDING_PHOTO_JOB_SPEC>/i)?.[1];
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i)?.[1];
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  const source = tagged ?? fenced ?? (firstBrace >= 0 && lastBrace > firstBrace ? text.slice(firstBrace, lastBrace + 1) : '');
  if (!source || !/"?wedding_date"?\s*:/i.test(source)) return null;
  try {
    const parsed = JSON.parse(source.trim()) as Partial<JobSpec>;
    if (!parsed.wedding_date || !parsed.venue || !Array.isArray(parsed.events)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function messageText(message: unknown): string | null {
  if (typeof message === 'string') return message;
  if (typeof message !== 'object' || message === null) return null;

  const payload = message as {
    message?: unknown;
    agent_response_event?: { agent_response?: unknown };
    user_transcription_event?: { user_transcript?: unknown };
  };

  if (typeof payload.message === 'string') return payload.message;
  if (typeof payload.agent_response_event?.agent_response === 'string') return payload.agent_response_event.agent_response;
  if (typeof payload.user_transcription_event?.user_transcript === 'string') return payload.user_transcription_event.user_transcript;
  return null;
}

export function VoiceIntake({ onSpecReceived }: VoiceIntakeProps) {
  const [transcript, setTranscript] = useState<string[]>([]);
  const transcriptRef = useRef<string[]>([]);
  const deliveredRef = useRef(false);
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID;
  const acceptBrief = (candidate: unknown) => {
    const spec = typeof candidate === 'string' ? extractJobSpec(candidate) : candidate as Partial<JobSpec>;
    if (!spec || !spec.wedding_date || !spec.venue || !Array.isArray(spec.events)) return 'The wedding brief was incomplete. Please collect the missing details before submitting it.';
    if (!deliveredRef.current) {
      deliveredRef.current = true;
      onSpecReceived(spec);
      toast.success('Wedding brief received. Please review and confirm it below.');
    }
    return 'Wedding brief saved. Thank the customer, explain that you will now contact photographers to compare current market prices, and end the call. Do not read JSON or field values aloud.';
  };

  const conversation = useConversation({
    clientTools: {
      submit_wedding_brief: acceptBrief,
    },
    onConnect: () => toast.success('Estimator connected. Start describing your wedding.'),
    onDisconnect: () => {
      const spec = extractJobSpec(transcriptRef.current.join('\n'));
      if (spec && !deliveredRef.current) {
        acceptBrief(spec);
      }
      toast.message('Estimator conversation ended.');
    },
    onError: (error) => toast.error(`Voice connection failed: ${String(error)}`),
    onMessage: (message: unknown) => {
      const content = messageText(message);
      if (!content) return;
      transcriptRef.current = [...transcriptRef.current, content];
      setTranscript((items) => [...items.slice(-7), content]);
      const spec = extractJobSpec(content) ?? extractJobSpec(transcriptRef.current.join('\n'));
      if (spec && !deliveredRef.current) {
        acceptBrief(spec);
      }
    },
  });

  const start = async () => {
    if (!agentId) {
      toast.error('Set NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID in .env.local to enable voice intake.');
      return;
    }
    try {
      deliveredRef.current = false;
      transcriptRef.current = [];
      setTranscript([]);
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({ agentId });
    } catch (error) {
      toast.error(`Unable to start voice intake: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const active = conversation.status === 'connected';
  return (
    <section className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Voice interview</p>
      <h2 className="mt-2 text-2xl font-semibold text-strong-950">Talk through your wedding</h2>
      <p className="mt-2 text-sm leading-relaxed text-sub-600">We’ll collect dates, events, coverage, deliverables, and logistics so every photographer quotes the same brief.</p>
      <div className="mt-8 flex flex-col items-center border-y border-stroke-soft-200 py-8">
        <button
          onClick={active ? () => void conversation.endSession() : () => void start()}
          className={`grid h-16 w-16 place-items-center rounded-full border transition-all ${
            active
              ? 'animate-pulse-slow border-red-500 bg-red-50 text-red-600 shadow-md'
              : 'border-stroke-soft-200 bg-weak-50 text-strong-950 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-600'
          }`}
          aria-label={active ? 'End voice intake' : 'Start voice intake'}
        >
          {active ? <Square size={22} fill="currentColor" /> : <Mic size={24} />}
        </button>
        <p className="mt-4 text-xs font-semibold uppercase tracking-[0.1em] text-sub-600">{active ? 'Listening live' : 'Start voice intake'}</p>
      </div>
      <div className="mt-5 min-h-20 space-y-2 text-sm text-sub-600">
        {transcript.length === 0 ? (
          <p className="text-sub-600">Live conversation transcript will appear here.</p>
        ) : (
          transcript.map((line, index) => (
            <p key={`${line}-${index}`} className="border-l-2 border-blue-500 pl-3 text-strong-950">
              {line}
            </p>
          ))
        )}
      </div>
    </section>
  );
}
