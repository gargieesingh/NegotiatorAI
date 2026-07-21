'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldAlert } from 'lucide-react';
import { StepProgress } from '@/components/negotiator-layout/StepProgress';
import { negotiationStorageKey, quotesStorageKey } from '@/lib/config';
import type { NegotiationResult, Quote } from '@/lib/types';

export default function NegotiatePage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>();
  const [result, setResult] = useState<NegotiationResult>();
  useEffect(() => { const storedQuotes = localStorage.getItem(quotesStorageKey); const storedResult = localStorage.getItem(negotiationStorageKey); if (!storedQuotes) { router.replace('/calls'); return; } try { setQuotes(JSON.parse(storedQuotes) as Quote[]); if (storedResult) setResult(JSON.parse(storedResult) as NegotiationResult); } catch { router.replace('/calls'); } }, [router]);
  if (!quotes) return null;
  if (!result) return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={3} /><div className="mt-12 border border-negotiator-warning/40 bg-negotiator-warning/5 p-8"><ShieldAlert className="text-negotiator-warning" /><h1 className="mt-5 text-3xl font-bold">Negotiation is waiting for verified calls.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">A negotiation begins only after the system has at least two real, itemized quotes. It will cite one of those exact quotes as leverage and retain the resulting live transcript.</p><button onClick={() => router.push('/calls')} className="mt-6 inline-flex items-center gap-2 bg-negotiator-accent px-4 py-3 text-sm font-semibold">Return to calls <ArrowRight size={16} /></button></div></div>;
  return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={3} /><p className="mt-10 text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Module 03 / The Closer</p><h1 className="mt-3 text-4xl font-bold">Negotiation evidence</h1><p className="mt-3 text-sm text-slate-400">Using a verified quote from {result.competing_quote_cited.company} as leverage against {result.target_company}.</p></div>;
}
