'use client';

import { ChevronDown, ChevronUp, CircleAlert } from 'lucide-react';
import { useState } from 'react';
import { WaveformAnim } from '@/components/calls/WaveformAnim';
import type { CompanyStyle, Quote } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type CallCardStatus = 'pending' | 'calling' | 'complete' | 'declined' | 'error';
interface CallCardProps { companyName: string; companyStyle: CompanyStyle; status: CallCardStatus; quote?: Quote; error?: string; }
const colors: Record<CallCardStatus, string> = { pending: 'border-l-negotiator-accent opacity-70', calling: 'border-l-negotiator-live shadow-[inset_3px_0_14px_rgba(16,185,129,0.18)]', complete: 'border-l-negotiator-success', declined: 'border-l-negotiator-danger', error: 'border-l-negotiator-warning' };
const labels: Record<CallCardStatus, string> = { pending: 'Queued', calling: 'Calling...', complete: 'Quote received', declined: 'Documented decline', error: 'Setup required' };

export function CallCard({ companyName, companyStyle, status, quote, error }: CallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const calling = status === 'calling';
  return <article className={`min-h-[340px] border border-negotiator-border border-l-[3px] bg-negotiator-surface p-5 ${colors[status]}`}>
    <header className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">{companyName}</h2><p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">{companyStyle.replace('_', ' ')}</p></div><span className="border border-negotiator-border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">{labels[status]}</span></header>
    {calling && <><WaveformAnim active /><p className="text-sm text-slate-400">Agent conversation in progress...</p></>}
    {(status === 'pending' || status === 'error') && <div className="mt-12"><WaveformAnim active={false} /><p className="text-sm leading-relaxed text-slate-400">{error ?? 'Waiting to place a verified live call.'}</p></div>}
    {status === 'declined' && <div className="mt-12 text-sm text-negotiator-danger">No quote was received. This outcome is retained as evidence rather than filled with an estimate.</div>}
    {status === 'complete' && quote && <div className="mt-6"><div className="space-y-2 text-sm text-slate-400">{[['Base coverage', quote.quote.base_coverage], ['Additional event coverage', quote.quote.additional_event_coverage], ['Videography', quote.quote.videography], ['Drone coverage', quote.quote.drone_coverage], ['Cinematic film', quote.quote.cinematic_film], ['Highlight reel', quote.quote.highlight_reel], ['Albums', quote.quote.albums], ['Travel', quote.quote.travel], ['Accommodation', quote.quote.accommodation], ['Taxes', quote.quote.taxes], ['Deposit', quote.quote.deposit], ['Overtime / hour', quote.quote.overtime_rate_per_hour]].map(([name, value]) => <div key={String(name)} className="flex justify-between gap-3"><span>{name}</span><span className="font-mono text-slate-200">{formatCurrency(Number(value))}</span></div>)}</div><div className="mt-4 flex items-end justify-between border-t border-negotiator-border pt-4"><span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Known all-in total</span><span className="font-mono text-2xl font-bold">{formatCurrency(quote.quote.total)}</span></div><p className="mt-2 text-xs text-slate-500">Valid until: {quote.quote.valid_until || 'Not stated'}</p><span className={`mt-3 inline-block px-2 py-1 text-[10px] font-bold ${quote.quote.binding ? 'bg-negotiator-success/15 text-negotiator-success' : 'bg-negotiator-warning/15 text-negotiator-warning'}`}>{quote.quote.binding ? 'Binding' : 'Non-binding'}</span>{quote.red_flags.map((flag) => <p key={flag} className="mt-3 flex gap-2 text-xs text-negotiator-warning"><CircleAlert size={14} />{flag}</p>)}<button onClick={() => setExpanded((value) => !value)} className="mt-5 flex items-center gap-1 text-xs text-negotiator-accent">View transcript {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>{expanded && <div className="mt-3 space-y-2 border-t border-negotiator-border pt-3">{quote.transcript.map((turn, index) => <p key={`${turn.timestamp}-${index}`} className={`p-2 text-xs ${turn.speaker === 'negotiator' ? 'ml-6 bg-negotiator-accent/15 text-slate-200' : 'mr-6 bg-negotiator-surface-2 text-slate-400'}`}>{turn.text}</p>)}</div>}</div>}
  </article>;
}
