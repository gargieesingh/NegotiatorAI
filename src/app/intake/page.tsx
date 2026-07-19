'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { DocumentUpload } from '@/components/intake/DocumentUpload';
import { JobSpecConfirm } from '@/components/intake/JobSpecConfirm';
import { VoiceIntake } from '@/components/intake/VoiceIntake';
import { StepProgress } from '@/components/layout/StepProgress';
import { jobSpecStorageKey } from '@/lib/config';
import type { JobSpec } from '@/lib/types';

export default function IntakePage() {
  const router = useRouter();
  const [spec, setSpec] = useState<Partial<JobSpec>>();
  const receiveSpec = (incoming: Partial<JobSpec>) => setSpec((current) => ({ ...current, ...incoming }));
  const confirm = (completed: JobSpec) => {
    localStorage.setItem(jobSpecStorageKey, JSON.stringify(completed));
    toast.success('Wedding photography brief locked. Starting quote collection.');
    router.push('/calls');
  };
  return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={1} /><div className="mt-10"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Module 01 / The Estimator</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">Build a quote-ready wedding brief.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Use voice or a wedding invitation / existing quote. Both routes produce the exact same brief, which you confirm before we contact photographers.</p></div><div className="mt-8 grid gap-6 lg:grid-cols-5"><div className="lg:col-span-3"><VoiceIntake onSpecReceived={receiveSpec} /></div><div className="lg:col-span-2"><DocumentUpload onSpecReceived={receiveSpec} /></div></div>{spec && <JobSpecConfirm spec={spec} onConfirm={confirm} />}</div>;
}
