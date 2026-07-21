'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileWarning } from 'lucide-react';
import { StepProgress } from '@/components/negotiator-layout/StepProgress';
import { jobSpecStorageKey, negotiationStorageKey, quotesStorageKey } from '@/lib/config';
import type { JobSpec, NegotiationResult, Quote } from '@/lib/types';

export default function ReportPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => { const job = localStorage.getItem(jobSpecStorageKey); const quotes = localStorage.getItem(quotesStorageKey); const negotiation = localStorage.getItem(negotiationStorageKey); if (!job || !quotes || !negotiation) { router.replace('/calls'); return; } try { JSON.parse(job) as JobSpec; JSON.parse(quotes) as Quote[]; JSON.parse(negotiation) as NegotiationResult; setReady(true); } catch { router.replace('/calls'); } }, [router]);
  if (!ready) return null;
  return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={4} /><section className="mt-12 border border-negotiator-border bg-negotiator-surface p-8"><FileWarning className="text-negotiator-warning" /><h1 className="mt-5 text-3xl font-bold">Your evidence-backed quote report</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">The report page is ready to generate only from completed live quotes and negotiation data. It will never create a report from invented transcripts or prices.</p><button onClick={() => router.push('/calls')} className="mt-6 inline-flex items-center gap-2 bg-negotiator-accent px-4 py-3 text-sm font-semibold">Complete quote calls <ArrowRight size={16} /></button></section></div>;
}
