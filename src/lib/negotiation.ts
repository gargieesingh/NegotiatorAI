import type { NegotiationStrategy, Quote } from '@/lib/types';

export function selectNegotiationStrategy(quotes: Quote[]): NegotiationStrategy | null {
  const received = quotes.filter((quote) => (quote.outcome === 'quote_received' || quote.final_price > 0) && (quote.quote?.total > 0 || quote.final_price > 0));
  if (received.length < 2) return null;
  const ordered = [...received].sort((left, right) => (left.quote?.total || left.final_price) - (right.quote?.total || right.final_price));
  const leverage = ordered[0];
  const target = ordered[ordered.length - 1];
  if (target.company_name === leverage.company_name) return null;
  const leveragePrice = leverage.quote?.total || leverage.final_price;
  const isBinding = leverage.quote?.binding ?? true;
  return { 
    target_company: target.company_name, 
    leverage_company: leverage.company_name, 
    leverage_amount: leveragePrice, 
    leverage_binding: isBinding, 
    approach: `Use the verified ${isBinding ? 'binding ' : ''}${leveragePrice} quote from ${leverage.company_name} to request a price match or a measurable included service from ${target.company_name}.` 
  };
}

export const selectWeddingNegotiationStrategy = selectNegotiationStrategy;
