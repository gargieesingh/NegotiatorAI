'use client';

import { motion } from 'framer-motion';
import { formatCurrency } from '@/lib/utils';

interface PriceTrackerProps {
  companyName: string;
  initialPrice: number;
  currentPrice: number;
  status: 'idle' | 'negotiating' | 'complete';
  priceChanged: boolean;
}

export function PriceTracker({
  companyName,
  initialPrice,
  currentPrice,
  status,
  priceChanged,
}: PriceTrackerProps) {
  const savings = initialPrice - currentPrice;
  return (
    <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-8 text-center shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sub-600">
        Target price / {companyName}
      </p>
      {status === 'negotiating' && (
        <p className="mt-4 inline-block rounded-full bg-blue-50 border border-blue-200 px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-blue-600 animate-pulse">
          Negotiating live...
        </p>
      )}
      {priceChanged ? (
        <div className="mt-6">
          <p className="font-mono text-3xl font-medium text-sub-600/70 line-through">
            {formatCurrency(initialPrice)}
          </p>
          <p className="my-2 text-3xl font-bold text-green-600">↓</p>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-mono text-5xl md:text-6xl font-extrabold tracking-tight text-green-600"
          >
            {formatCurrency(currentPrice)}
          </motion.p>
          <p className="mt-5 inline-block rounded-xl border border-green-200 bg-green-50 px-4 py-2 text-sm font-bold text-green-700 shadow-xs">
            SAVED {formatCurrency(savings)}
          </p>
        </div>
      ) : (
        <div className="mt-8">
          <p className="font-mono text-5xl md:text-6xl font-extrabold tracking-tight text-strong-950">
            {formatCurrency(currentPrice)}
          </p>
          {status === 'complete' && (
            <p className="mt-5 inline-block rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.08em] text-amber-700">
              Held firm - best offer declined
            </p>
          )}
        </div>
      )}
    </section>
  );
}

