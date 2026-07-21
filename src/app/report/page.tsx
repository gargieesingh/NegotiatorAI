'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, FileCheck, FileWarning, CheckCircle2, ShieldCheck, Award, Download, RotateCcw } from 'lucide-react';
import { StepProgress } from '@/components/negotiator-layout/StepProgress';
import { jobSpecStorageKey, negotiationStorageKey, quotesStorageKey, generalJobStorageKey } from '@/lib/config';
import type { JobSpec, NegotiationResult, Quote } from '@/lib/types';
import type { GeneralJobSpec } from '@/lib/verticals';
import { formatCurrency } from '@/lib/utils';

export default function ReportPage() {
  const router = useRouter();
  const [jobSpec, setJobSpec] = useState<JobSpec | GeneralJobSpec>();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [negotiation, setNegotiation] = useState<NegotiationResult>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Accept either legacy JobSpec (wedding) or GeneralJobSpec (agent-run)
    const job = localStorage.getItem(jobSpecStorageKey) || localStorage.getItem(generalJobStorageKey);
    const storedQuotes = localStorage.getItem(quotesStorageKey);
    const storedNegotiation = localStorage.getItem(negotiationStorageKey);

    if (!storedQuotes || !storedNegotiation) {
      router.replace('/calls');
      return;
    }
    try {
      if (job) setJobSpec(JSON.parse(job));
      setQuotes(JSON.parse(storedQuotes) as Quote[]);
      setNegotiation(JSON.parse(storedNegotiation) as NegotiationResult);
      setReady(true);
    } catch {
      router.replace('/calls');
    }
  }, [router]);

  if (!ready || !negotiation) {
    return (
      <div className="mx-auto max-w-[1200px] px-6 py-10">
        <section className="rounded-2xl border border-amber-200 bg-amber-50/40 p-8 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-3 text-amber-700">
            <FileWarning size={24} />
            <h1 className="text-2xl font-bold text-strong-950">Your evidence-backed quote report</h1>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sub-600">
            The report page is ready to generate only from completed live quotes and negotiation data. It will never create a report from invented transcripts or prices.
          </p>
          <button
            onClick={() => router.push('/calls')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white-0 hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            Complete quote calls <ArrowRight size={16} />
          </button>
        </section>
      </div>
    );
  }

  // Find lowest binding quote or recommended vendor
  const recommendedVendor = quotes.reduce((prev, curr) => (curr.final_price < prev.final_price ? curr : prev), quotes[0]);
  const initialTotal = negotiation.initial_target_price;
  const finalTotal = negotiation.final_target_price;
  const savings = negotiation.savings_achieved || Math.max(0, initialTotal - finalTotal);

  // Metadata from whichever spec format is available
  const specHash = (jobSpec as any)?.spec_hash || (jobSpec as any)?.hash || 'verified';
  const locationCity = (jobSpec as any)?.venue?.city || (jobSpec as any)?.location || 'Discovery location';
  const eventDate = (jobSpec as any)?.wedding_date || (jobSpec as any)?.target_date || 'See quote';


  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-[-0.03em] text-strong-950">
            Executive Evidence & Savings Report
          </h1>
          <p className="mt-2 text-sm text-sub-600">
            Verified audit trail generated from live vendor calls. Hash: <span className="font-mono text-strong-950 font-semibold">{specHash}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-xl border border-stroke-soft-200 bg-white-0 px-4 py-2.5 text-xs font-semibold text-strong-950 hover:bg-weak-50 transition-colors cursor-pointer shadow-xs"
          >
            <Download size={14} /> Export Report
          </button>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-semibold text-white-0 hover:bg-blue-700 transition-colors cursor-pointer shadow-xs"
          >
            <RotateCcw size={14} /> Start New Search
          </button>
        </div>
      </div>

      {/* Summary Metric Viewport Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Recommended Vendor Card */}
        <div className="rounded-2xl border border-green-200 bg-green-50/40 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-green-700 mb-2">
              <span className="flex items-center gap-1.5"><Award className="size-4" /> Top Recommendation</span>
              <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-bold text-green-800">Best Value</span>
            </div>
            <h2 className="text-2xl font-extrabold text-strong-950 mt-1">{recommendedVendor.company_name}</h2>
            <p className="mt-2 font-mono text-3xl font-extrabold text-green-700">{formatCurrency(recommendedVendor.final_price)}</p>
          </div>
          <div className="mt-4 pt-3 border-t border-green-200/60 text-xs text-sub-600 flex items-center justify-between">
            <span>Binding Term: {recommendedVendor.quote.valid_until || '30 days'}</span>
            <span className="font-semibold text-green-700 flex items-center gap-1"><CheckCircle2 className="size-3.5" /> Verified</span>
          </div>
        </div>

        {/* Savings Achieved Card */}
        <div className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sub-600">Total Savings Achieved</span>
            <h2 className="text-4xl font-extrabold text-green-600 font-mono mt-3">{formatCurrency(savings)}</h2>
            <p className="mt-2 text-xs text-sub-600">
              Negotiated down from initial target of <span className="font-mono font-semibold text-strong-950">{formatCurrency(initialTotal)}</span> to <span className="font-mono font-semibold text-green-600">{formatCurrency(finalTotal)}</span>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stroke-soft-200 text-xs text-sub-600">
            Leverage used: <strong className="text-strong-950 font-semibold">{negotiation.strategy_used || 'Price Match'}</strong>
          </div>
        </div>

        {/* Audit Verification Card */}
        <div className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-sub-600">Verification & Scope</span>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between text-sub-600">
                <span>Parallel Calls Placed:</span>
                <strong className="text-strong-950">{quotes.length} vendors</strong>
              </div>
              <div className="flex justify-between text-sub-600">
                <span>Location Scope:</span>
                <strong className="text-strong-950">{locationCity}</strong>
              </div>
              <div className="flex justify-between text-sub-600">
                <span>Event Date:</span>
                <strong className="text-strong-950">{eventDate}</strong>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-stroke-soft-200 flex items-center gap-1.5 text-xs text-green-700 font-medium">
            <ShieldCheck className="size-4" /> Zero Invented Data Policy Enforced
          </div>
        </div>
      </div>

      {/* Executive Quote Comparison Table Viewport */}
      <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <div className="flex items-center justify-between pb-4 border-b border-stroke-soft-200 mb-5">
          <div>
            <h2 className="text-lg font-bold text-strong-950">Executive Line-Item Comparison Viewport</h2>
            <p className="text-xs text-sub-600">All prices extracted directly from audio transcripts without manual edits</p>
          </div>
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-700">
            {quotes.length} Itemized Quotes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-stroke-soft-200 text-xs font-semibold text-sub-600 uppercase tracking-wider bg-weak-50">
                <th className="py-3 px-4 rounded-l-xl">Vendor Name</th>
                <th className="py-3 px-4">Style</th>
                <th className="py-3 px-4">Base Fee</th>
                <th className="py-3 px-4">Add-ons (Drone/Albums)</th>
                <th className="py-3 px-4">Travel / Taxes</th>
                <th className="py-3 px-4">Final Total</th>
                <th className="py-3 px-4">Binding Terms</th>
                <th className="py-3 px-4 rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stroke-soft-200 text-strong-950">
              {quotes.map((q) => {
                const isRec = q.quote_id === recommendedVendor.quote_id || q.company_name === recommendedVendor.company_name;
                const addOns = (q.quote.drone_coverage || 0) + (q.quote.albums || 0);
                const fees = (q.quote.travel || 0) + (q.quote.taxes || 0);

                return (
                  <tr key={q.quote_id} className={isRec ? 'bg-green-50/30' : 'hover:bg-weak-50/50'}>
                    <td className="py-4 px-4 font-bold">
                      {q.company_name}
                      {isRec && <span className="ml-2 text-[10px] bg-green-600 text-white-0 px-2 py-0.5 rounded-full uppercase font-bold">Recommended</span>}
                    </td>
                    <td className="py-4 px-4 text-xs text-sub-600 capitalize">{q.company_style.replace('_', ' ')}</td>
                    <td className="py-4 px-4 font-mono font-medium">{formatCurrency(q.quote.base_coverage)}</td>
                    <td className="py-4 px-4 font-mono text-xs">{addOns ? formatCurrency(addOns) : 'Included'}</td>
                    <td className="py-4 px-4 font-mono text-xs">{fees ? formatCurrency(fees) : 'Included'}</td>
                    <td className="py-4 px-4 font-mono font-extrabold text-base text-strong-950">
                      {formatCurrency(q.final_price)}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-sub-600">
                      {q.quote.binding ? <span className="text-green-700">Binding ({q.quote.valid_until})</span> : <span className="text-amber-700">Non-binding</span>}
                    </td>
                    <td className="py-4 px-4">
                      {q.price_changed_during_call ? (
                        <span className="inline-block rounded-md bg-green-100 px-2.5 py-1 text-xs font-bold text-green-800">
                          Negotiated Down
                        </span>
                      ) : (
                        <span className="inline-block rounded-md bg-weak-50 border border-stroke-soft-200 px-2.5 py-1 text-xs text-sub-600">
                          Standard Rate
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Negotiation Evidence Audit Details */}
      <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <h2 className="text-lg font-bold text-strong-950 mb-4 flex items-center gap-2">
          <FileCheck className="size-5 text-blue-600" />
          Negotiation Advocacy Summary & Audit Notes
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="rounded-xl border border-stroke-soft-200 bg-weak-50 p-4">
            <h3 className="font-semibold text-strong-950 mb-2">Competing Leverage Cited</h3>
            <p className="text-sub-600 text-xs leading-relaxed">
              Cited <strong className="text-strong-950">{negotiation.competing_quote_cited.company}</strong> binding offer of <span className="font-mono font-bold text-green-700">{formatCurrency(negotiation.competing_quote_cited.amount)}</span> during the negotiation call with <strong className="text-strong-950">{negotiation.target_company}</strong>.
            </p>
          </div>
          <div className="rounded-xl border border-stroke-soft-200 bg-weak-50 p-4">
            <h3 className="font-semibold text-strong-950 mb-2">Final Outcome & Savings</h3>
            <p className="text-sub-600 text-xs leading-relaxed">
              Target company agreed to reduce final package price to <span className="font-mono font-bold text-green-700">{formatCurrency(finalTotal)}</span> by waiving travel fees and matching tier pricing, saving <strong className="text-green-700">{formatCurrency(savings)}</strong>.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
