'use client';

import { useConversation } from '@11labs/react';
import { Mic, Square } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { VerticalConfig } from '@/lib/verticals';

interface GenericVoiceIntakeProps {
  config: VerticalConfig;
  onSpecReceived: (values: Record<string, string | number | boolean>) => void;
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

export function GenericVoiceIntake({ config, onSpecReceived }: GenericVoiceIntakeProps) {
  const [transcript, setTranscript] = useState<string[]>([]);
  const delivered = useRef(false);
  const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID;
  const accept = (candidate: unknown) => {
    const values = toValues(candidate, config);
    if (!values) return 'The brief could not be saved because the configured fields were missing. Ask the customer the missing questions.';
    if (!delivered.current) { delivered.current = true; onSpecReceived(values); toast.success('Voice intake received. Review and confirm the brief below.'); }
    return 'The brief is saved. Thank the customer, explain that the next step is vendor discovery, and end the call. Do not read JSON or field names aloud.';
  };
  const conversation = useConversation({
    clientTools: { submit_job_spec: accept },
    onConnect: () => toast.success('Estimator connected. Describe your request.'),
    onDisconnect: () => toast.message('Estimator conversation ended.'),
    onError: (error) => toast.error(`Voice connection failed: ${String(error)}`),
    onMessage: (event: unknown) => {
      const message = typeof event === 'object' && event !== null && typeof (event as { message?: unknown }).message === 'string' ? (event as { message: string }).message : '';
      if (!message) return;
      setTranscript((current) => [...current.slice(-6), message]);
      if (message.includes('{')) accept(message.slice(message.indexOf('{'), message.lastIndexOf('}') + 1));
    },
  });
  const start = async () => {
    if (!agentId) { toast.error('Set NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID to enable voice intake.'); return; }
    try { delivered.current = false; setTranscript([]); await navigator.mediaDevices.getUserMedia({ audio: true }); await conversation.startSession({ agentId, dynamicVariables: { vertical_config: JSON.stringify(config), intake_fields: config.intakeFields.map((field) => field.key).join(', ') } }); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Could not start voice intake.'); }
  };
  const active = conversation.status === 'connected';
  return <section className="mt-8 border border-negotiator-border bg-negotiator-surface p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Voice interview</p><h2 className="mt-2 text-xl font-semibold">Talk through your {config.displayName.toLowerCase()} request</h2><p className="mt-2 text-sm text-slate-400">The estimator follows this vertical’s configured minimum fields. You still confirm every value before vendor discovery.</p><div className="mt-5 flex items-center gap-4 border-y border-negotiator-border py-5"><button onClick={active ? () => void conversation.endSession() : () => void start()} className={`grid h-12 w-12 place-items-center border ${active ? 'border-negotiator-danger text-negotiator-danger' : 'border-negotiator-accent text-negotiator-accent'}`}>{active ? <Square size={16} fill="currentColor" /> : <Mic size={19} />}</button><p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-400">{active ? 'Listening live' : 'Start voice intake'}</p></div>{transcript.length > 0 && <div className="mt-4 space-y-2 text-sm text-slate-400">{transcript.map((line, index) => <p key={`${line}-${index}`} className="border-l border-negotiator-accent pl-3">{line}</p>)}</div>}</section>;
}
