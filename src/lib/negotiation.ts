import type { NegotiationStrategy, Quote } from '@/lib/types';

export function selectWeddingNegotiationStrategy(quotes: Quote[]): NegotiationStrategy | null {
  const received = quotes.filter((quote) => quote.outcome === 'quote_received' && quote.quote.total > 0);
  const valid = received.filter((quote) => !quote.red_flags.some((flag) => /suspiciously low|incomplete coverage|opaque/i.test(flag)));
  if (valid.length < 2) return null;
  const ordered = [...valid].sort((left, right) => left.quote.total - right.quote.total);
  const leverage = ordered[0];
  const target = ordered[ordered.length - 1];
  if (target.company_name === leverage.company_name) return null;
  return { target_company: target.company_name, leverage_company: leverage.company_name, leverage_amount: leverage.quote.total, leverage_binding: leverage.quote.binding, approach: `Use the verified ${leverage.quote.binding ? 'binding ' : ''}${leverage.quote.total} quote from ${leverage.company_name} to request a price match or a measurable included service from ${target.company_name}.` };
}
