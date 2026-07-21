'use client';

import { ChevronDown, ChevronUp, CircleAlert, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { WaveformAnim } from '@/components/calls/WaveformAnim';
import type { CompanyStyle, Quote } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

type CallCardStatus = 'pending' | 'calling' | 'processing' | 'complete' | 'declined' | 'no_answer' | 'error';
interface CallCardProps {
  companyName: string;
  companyStyle: CompanyStyle;
  status: CallCardStatus;
  quote?: Quote;
  error?: string;
  discoveredOnly?: boolean;
}

const colors: Record<CallCardStatus, string> = {
  pending: 'opacity-85',
  calling: 'shadow-[0_0_1.5rem_0_rgba(51,92,255,0.1)] border-blue-300',
  processing: 'border-blue-200 bg-blue-50/20',
  complete: 'border-emerald-200 bg-white-0',
  declined: 'border-amber-200 bg-amber-50/20',
  no_answer: 'border-amber-200 bg-amber-50/20',
  error: 'border-red-200 bg-red-50/20',
};

const labels: Record<CallCardStatus, string> = {
  pending: 'Queued',
  calling: 'Calling...',
  processing: 'Processing quote',
  complete: 'Quote received',
  declined: 'Documented decline',
  no_answer: 'Not picked up',
  error: 'Setup required',
};

export function CallCard({ companyName, companyStyle, status, quote, error, discoveredOnly = false }: CallCardProps) {
  const [expanded, setExpanded] = useState(false);
  const calling = status === 'calling';

  return (
    <article
      className={`min-h-[340px] rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] transition-all ${colors[status]}`}
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-strong-950">{companyName}</h2>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.1em] text-sub-600">
            {companyStyle.replace('_', ' ')}
          </p>
        </div>
        <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] ${
          calling
            ? 'border-blue-200 bg-blue-50 text-blue-600 font-bold flex items-center gap-1.5'
            : status === 'complete'
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-bold'
            : 'border-stroke-soft-200 bg-weak-50 text-sub-600'
        }`}>
          {calling && <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />}
          {discoveredOnly ? 'Discovered' : labels[status]}
        </span>
      </header>

      {calling && (
        <div className="mt-4">
          <WaveformAnim active={true} />
          <p className="text-center text-xs font-medium text-sub-600">
            AI Agent conversation & rate negotiation in progress...
          </p>
        </div>
      )}

      {(status === 'pending' || status === 'error') && (
        <div className="mt-6">
          <WaveformAnim active={false} />
          <p className="mt-2 text-sm leading-relaxed text-sub-600">
            {error ?? 'Waiting to place a verified live call.'}
          </p>
        </div>
      )}

      {status === 'declined' && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm font-medium text-red-600">
          No quote was received. This outcome is retained as evidence rather than filled with an estimate.
        </div>
      )}

      {status === 'processing' && (
        <div className="mt-6">
          <WaveformAnim active={false} />
          <p className="mt-3 text-center text-xs font-medium text-sub-600">
            Call ended. Waiting for ElevenLabs to deliver the transcript and extract the quote.
          </p>
        </div>
      )}

      {status === 'no_answer' && (
        <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/50 p-4 text-sm font-medium text-amber-700">
          This vendor did not pick up the call. No quote was recorded.
        </div>
      )}

      {status === 'complete' && quote && (
        <div className="mt-6">
          <div className="space-y-2 text-sm text-sub-600">
            {[
              ['Base coverage', quote.quote.base_coverage],
              ['Additional event coverage', quote.quote.additional_event_coverage],
              ['Videography', quote.quote.videography],
              ['Drone coverage', quote.quote.drone_coverage],
              ['Cinematic film', quote.quote.cinematic_film],
              ['Highlight reel', quote.quote.highlight_reel],
              ['Albums', quote.quote.albums],
              ['Travel', quote.quote.travel],
              ['Accommodation', quote.quote.accommodation],
              ['Taxes', quote.quote.taxes],
              ['Deposit', quote.quote.deposit],
              ['Overtime / hour', quote.quote.overtime_rate_per_hour],
              ...quote.quote.other_fees.map((fee) => [fee.name, fee.amount]),
            ]
              .filter(([, value]) => Number(value) > 0)
              .map(([name, value]) => (
                <div key={String(name)} className="flex justify-between gap-3">
                  <span>{name}</span>
                  <span className="font-mono font-medium text-strong-950">
                    {formatCurrency(Number(value))}
                  </span>
                </div>
              ))}
          </div>

          <div className="mt-4 flex items-end justify-between border-t border-stroke-soft-200 pt-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sub-600">
              Known all-in total
            </span>
            <span className="font-mono text-2xl font-bold text-strong-950">
              {formatCurrency(quote.quote.total)}
            </span>
          </div>

          <p className="mt-2 text-xs text-sub-600">Valid until: {quote.quote.valid_until || 'Not stated'}</p>

          <span
            className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${
              quote.quote.binding
                ? 'border border-green-200 bg-green-100 text-green-700'
                : 'border border-amber-200 bg-amber-100 text-amber-700'
            }`}
          >
            {quote.quote.binding ? 'Binding' : 'Non-binding'}
          </span>

          {quote.red_flags.map((flag) => (
            <div key={flag} className="mt-3 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs font-medium text-amber-700">
              <CircleAlert size={14} className="shrink-0" />
              <span>{flag}</span>
            </div>
          ))}

          <button
            onClick={() => setExpanded((value) => !value)}
            className="mt-5 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
          >
            View transcript {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {expanded && (
            <div className="mt-3 max-h-64 space-y-2.5 overflow-y-auto border-t border-stroke-soft-200 pt-3 pr-1">
              {quote.transcript && quote.transcript.map((turn, index) => {
                if (!turn) return null;
                const turnObj = turn as unknown as Record<string, unknown>;
                const speaker = String(turnObj.speaker || turnObj.role || 'vendor');
                const text = String(turnObj.text || turnObj.message || '');
                const isNegotiator = speaker === 'negotiator' || speaker === 'assistant';

                return (
                  <div
                    key={`${turn.timestamp || index}-${index}`}
                    className={`rounded-2xl p-3 text-xs leading-relaxed ${
                      isNegotiator
                        ? 'ml-6 border border-blue-100 bg-blue-50 text-strong-950 shadow-sm'
                        : 'mr-6 border border-stroke-soft-200 bg-weak-50 text-sub-600'
                    }`}
                  >
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-sub-600/70">
                      {isNegotiator ? 'Negotiator AI' : companyName}
                    </p>
                    <p>{text}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
