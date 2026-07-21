'use client';

import { LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentUpload } from '@/components/intake/DocumentUpload';
import { GenericBriefForm } from '@/components/intake/GenericBriefForm';
import { GenericDocumentUpload } from '@/components/intake/GenericDocumentUpload';
import { GenericVoiceIntake } from '@/components/intake/GenericVoiceIntake';
import { JobSpecConfirm } from '@/components/intake/JobSpecConfirm';
import { VoiceIntake } from '@/components/intake/VoiceIntake';
import { StepProgress } from '@/components/negotiator-layout/StepProgress';
import { generalJobStorageKey, jobSpecStorageKey } from '@/lib/config';
import type { JobSpec } from '@/lib/types';
import type { GeneralJobSpec, VerticalConfig } from '@/lib/verticals';

const examples = ['I need to move a two-bedroom apartment in Charlotte.', 'I need wedding photographers for events in Delhi.', 'My car needs a repair estimate in Austin.', 'I need contractor bids for a kitchen remodel.'];

export default function IntakePage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<VerticalConfig>();
  const [classification, setClassification] = useState<{ confidence: number; reason: string; source: string }>();
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<Partial<JobSpec>>();
  const [genericValues, setGenericValues] = useState<Record<string, string | number | boolean>>();
  const receiveGenericValues = (incoming: Record<string, string | number | boolean>) => setGenericValues((current) => ({ ...current, ...incoming }));
  const receiveSpec = (incoming: Partial<JobSpec>) => setSpec((current) => ({ ...current, ...incoming }));

  const identify = async () => {
    if (description.trim().length < 8) { toast.error('Briefly describe what you need priced first.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/verticals/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description }) });
      const body = await response.json() as { config?: VerticalConfig; confidence?: number; reason?: string; source?: string; error?: string };
      if (!response.ok || !body.config) throw new Error(body.error ?? 'Could not identify the service type.');
      setConfig(body.config);
      setClassification({ confidence: body.confidence ?? 0, reason: body.reason ?? '', source: body.source ?? 'unknown' });
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not identify the service type.'); }
    finally { setLoading(false); }
  };

  const confirmWedding = (completed: JobSpec) => {
    localStorage.setItem(jobSpecStorageKey, JSON.stringify(completed));
    toast.success('Wedding photography brief locked. Starting quote collection.');
    router.push('/calls');
  };
  const confirmGeneric = (job: GeneralJobSpec) => {
    localStorage.setItem(generalJobStorageKey, JSON.stringify(job));
    toast.success('Your brief is locked. Review the discovered vendor list next.');
    router.push('/discover');
  };

  return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={1} /><div className="mt-10"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Module 01 / The Estimator</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">Build a quote-ready brief for any phone-priced service.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Describe what you need. The system proposes a vertical-specific intake structure, then you confirm one immutable brief before a vendor is contacted.</p></div>{!config ? <section className="mt-8 border border-negotiator-border bg-negotiator-surface p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">First, identify your market</p><h2 className="mt-2 text-2xl font-semibold">What would you like us to price-shop?</h2><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Example: I need quotes to move a two-bedroom apartment from Rock Hill to Charlotte next month." className="mt-5 min-h-28 w-full border border-negotiator-border bg-negotiator-surface-2 p-4 text-sm outline-none focus:border-negotiator-accent" /><div className="mt-3 flex flex-wrap gap-2">{examples.map((example) => <button key={example} onClick={() => setDescription(example)} className="border border-negotiator-border px-3 py-2 text-xs text-slate-400 hover:border-negotiator-accent hover:text-slate-100">{example}</button>)}</div><button onClick={() => void identify()} disabled={loading} className="mt-5 inline-flex items-center gap-2 bg-negotiator-accent px-5 py-3 text-sm font-semibold disabled:opacity-60">{loading ? <LoaderCircle className="animate-spin" size={16} /> : <Sparkles size={16} />}Identify service and build intake</button></section> : <><section className="mt-8 border border-negotiator-success/40 bg-negotiator-success/5 p-5"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-success">Proposed configuration</p><h2 className="mt-2 text-xl font-semibold">{config.displayName}</h2><p className="mt-2 text-sm text-slate-400">{config.summary} {classification && `(${Math.round(classification.confidence * 100)}% confidence — ${classification.reason})`}</p><button onClick={() => { setConfig(undefined); setSpec(undefined); setGenericValues(undefined); }} className="mt-3 text-xs text-negotiator-accent">Choose a different service</button></section>{config.id === 'wedding_photography' ? <><div className="mt-8 grid gap-6 lg:grid-cols-5"><div className="lg:col-span-3"><VoiceIntake onSpecReceived={receiveSpec} /></div><div className="lg:col-span-2"><DocumentUpload onSpecReceived={receiveSpec} /></div></div>{spec && <JobSpecConfirm spec={spec} onConfirm={confirmWedding} />}</> : <><GenericVoiceIntake config={config} onSpecReceived={receiveGenericValues} /><GenericDocumentUpload config={config} onSpecReceived={receiveGenericValues} /><GenericBriefForm config={config} initialValues={genericValues} onConfirm={confirmGeneric} /></>}</>}</div>;
}
