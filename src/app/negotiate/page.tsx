'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldAlert, TrendingDown, CheckCircle2, DollarSign, MessageSquare, Award } from 'lucide-react';
import { StepProgress } from '@/components/negotiator-layout/StepProgress';
import { PriceTracker } from '@/components/negotiate/PriceTracker';
import { negotiationStorageKey, quotesStorageKey } from '@/lib/config';
import type { NegotiationResult, Quote } from '@/lib/types';
import { formatCurrency } from '@/lib/utils';

export default function NegotiatePage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>();
  const [result, setResult] = useState<NegotiationResult>();

  useEffect(() => {
    const storedQuotes = localStorage.getItem(quotesStorageKey);
    const storedResult = localStorage.getItem(negotiationStorageKey);
    if (!storedQuotes) {
      router.replace('/calls');
      return;
    }
    try {
      setQuotes(JSON.parse(storedQuotes) as Quote[]);
      if (storedResult) setResult(JSON.parse(storedResult) as NegotiationResult);
    } catch {
      router.replace('/calls');
    }
  }, [router]);

  if (!quotes) return null;

  if (!result) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <StepProgress current={3} />
        <div className="mt-12 rounded-2xl border border-amber-200 bg-amber-50/40 p-8 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldAlert size={24} />
            <h1 className="text-2xl font-bold text-strong-950">Negotiation is waiting for verified calls</h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sub-600">
            A negotiation begins only after the system has at least two real, itemized quotes. It will cite one of those exact quotes as leverage and retain the resulting live transcript.
          </p>
          <button
            onClick={() => router.push('/calls')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white-0 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Return to calls <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  const initialPrice = result.initial_target_price;
  const finalPrice = result.final_target_price;
  const savings = result.savings_achieved || initialPrice - finalPrice;

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <StepProgress current={3} />
      
      {/* Page Header */}
      <div className="mt-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
          Module 03 / The Closer
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-strong-950">
          Negotiation evidence & leverage
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sub-600">
          Using a verified binding quote from <strong className="text-strong-950 font-semibold">{result.competing_quote_cited.company}</strong> ({formatCurrency(result.competing_quote_cited.amount)}) as leverage against <strong className="text-strong-950 font-semibold">{result.target_company}</strong>.
        </p>
      </div>

      {/* Main Grid: Strategy Card + Price Tracker */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Strategy Card */}
        <div className="md:col-span-7 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-stroke-soft-200">
              <div className="flex items-center gap-2">
                <Award className="size-5 text-blue-600" />
                <h2 className="font-semibold text-strong-950">Leverage Strategy Strategy</h2>
              </div>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                {result.strategy_used || 'Price Match Leverage'}
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-stroke-soft-200 bg-weak-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-sub-600">Cited Benchmark Quote</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-strong-950">{result.competing_quote_cited.company}</span>
                  <span className="font-mono text-xl font-extrabold text-green-600">{formatCurrency(result.competing_quote_cited.amount)}</span>
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-sub-600">
                  <CheckCircle2 className="size-4 text-green-600" />
                  <span>Binding quote verified in Module 02</span>
                </div>
              </div>

              <div className="rounded-xl border border-stroke-soft-200 bg-weak-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-sub-600">Target Vendor</p>
                <div className="mt-2 flex items-baseline justify-between">
                  <span className="text-lg font-bold text-strong-950">{result.target_company}</span>
                  <span className="font-mono text-base font-semibold text-sub-600 line-through">{formatCurrency(initialPrice)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-stroke-soft-200 flex items-center justify-between text-xs text-sub-600">
            <span>Outcome Status: <strong className="text-strong-950 font-semibold">{result.outcome.replace('_', ' ')}</strong></span>
            {result.price_changed && (
              <span className="font-bold text-green-600 flex items-center gap-1">
                <TrendingDown className="size-4" /> Reduced by {formatCurrency(savings)}
              </span>
            )}
          </div>
        </div>

        {/* Live Price Tracker Component */}
        <div className="md:col-span-5">
          <PriceTracker
            companyName={result.target_company}
            initialPrice={initialPrice}
            currentPrice={finalPrice}
            status="complete"
            priceChanged={result.price_changed}
          />
        </div>
      </div>

      {/* Price Breakdown Table */}
      <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <h2 className="font-semibold text-strong-950 flex items-center gap-2 mb-4">
          <DollarSign className="size-5 text-blue-600" />
          Price & Savings Breakdown Table
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 text-xs font-semibold text-sub-600 uppercase tracking-wider bg-weak-50">
                <th className="py-3 px-4 rounded-l-xl">Stage</th>
                <th className="py-3 px-4">Vendor</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Binding Terms</th>
                <th className="py-3 px-4 rounded-r-xl">Delta Savings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200 text-strong-950">
              <tr>
                <td className="py-3.5 px-4 font-medium text-sub-600">Initial Target Offer</td>
                <td className="py-3.5 px-4 font-semibold">{result.target_company}</td>
                <td className="py-3.5 px-4 font-mono font-semibold">{formatCurrency(initialPrice)}</td>
                <td className="py-3.5 px-4 text-xs text-sub-600">Initial Quote</td>
                <td className="py-3.5 px-4 font-mono text-sub-600">—</td>
              </tr>
              <tr className="bg-weak-50/50">
                <td className="py-3.5 px-4 font-medium text-sub-600">Competing Benchmark</td>
                <td className="py-3.5 px-4 font-semibold">{result.competing_quote_cited.company}</td>
                <td className="py-3.5 px-4 font-mono font-semibold text-green-600">{formatCurrency(result.competing_quote_cited.amount)}</td>
                <td className="py-3.5 px-4 text-xs font-semibold text-green-700">Binding Guaranteed</td>
                <td className="py-3.5 px-4 font-mono text-green-600 font-semibold">-{formatCurrency(initialPrice - result.competing_quote_cited.amount)}</td>
              </tr>
              <tr className="bg-green-50/30">
                <td className="py-3.5 px-4 font-semibold text-green-800">Final Negotiated Offer</td>
                <td className="py-3.5 px-4 font-bold text-strong-950">{result.target_company}</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-green-700">{formatCurrency(finalPrice)}</td>
                <td className="py-3.5 px-4 text-xs font-semibold text-green-800">Waived Fees & Discounted</td>
                <td className="py-3.5 px-4 font-mono font-extrabold text-green-700">-{formatCurrency(savings)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Negotiation Evidence Transcript */}
      <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <div className="flex items-center gap-2 pb-4 border-b border-stroke-soft-200 mb-6">
          <MessageSquare className="size-5 text-blue-600" />
          <div>
            <h2 className="font-semibold text-strong-950">Live Negotiation Dialogue Transcript</h2>
            <p className="text-xs text-sub-600">Exact key dialogue turns logged during the automated leverage call</p>
          </div>
        </div>

        <div className="space-y-3">
          {result.transcript.map((turn, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border text-sm ${
                turn.speaker === 'negotiator'
                  ? 'border-blue-200 bg-blue-50/60 ml-auto max-w-[85%] text-strong-950'
                  : 'border-stroke-soft-200 bg-weak-50 mr-auto max-w-[85%] text-strong-950'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sub-600">
                  {turn.speaker === 'negotiator' ? 'AI Negotiator' : result.target_company}
                </span>
                {turn.is_key_moment && (
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
                    Key Moment
                  </span>
                )}
              </div>
              <p className="leading-relaxed">{turn.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom Action Footer */}
      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <div>
          <h3 className="font-semibold text-strong-950">Negotiation evidence verified & complete</h3>
          <p className="mt-1 text-sm text-sub-600">Generate the final executive quote report with full audit trail.</p>
        </div>
        <button
          onClick={() => router.push('/report')}
          className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white-0 hover:bg-green-700 transition-colors shadow-xs cursor-pointer"
        >
          View Executive Evidence Report <ArrowRight size={16} />
        </button>
      </section>
    </div>
  );
}
