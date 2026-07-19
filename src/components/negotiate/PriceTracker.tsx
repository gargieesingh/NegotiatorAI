'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface PriceTrackerProps { companyName: string; initialPrice: number; currentPrice: number; status: 'idle' | 'negotiating' | 'complete'; priceChanged: boolean; }
export function PriceTracker({ companyName, initialPrice, currentPrice, status, priceChanged }: PriceTrackerProps) {
  const savings = initialPrice - currentPrice;
  return <section className="mt-8 border border-negotiator-border bg-negotiator-surface p-8 text-center"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">Target price / {companyName}</p>{status === 'negotiating' && <p className="mt-4 inline-block animate-pulse-slow bg-negotiator-accent/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-negotiator-accent">Negotiating...</p>}{priceChanged ? <div className="mt-6"><p className="font-mono text-3xl text-slate-500 line-through">{formatCurrency(initialPrice)}</p><p className="my-2 text-3xl text-negotiator-success">↓</p><motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="font-mono text-6xl font-bold text-negotiator-success">{formatCurrency(currentPrice)}</motion.p><p className="mt-5 inline-block bg-negotiator-success/15 px-3 py-2 text-sm font-bold text-negotiator-success">SAVED {formatCurrency(savings)}</p></div> : <div className="mt-8"><p className="font-mono text-6xl font-bold">{formatCurrency(currentPrice)}</p>{status === 'complete' && <p className="mt-5 inline-block bg-negotiator-warning/15 px-3 py-2 text-xs font-bold uppercase tracking-[0.08em] text-negotiator-warning">Held firm - best offer declined</p>}</div>}</section>;
}
