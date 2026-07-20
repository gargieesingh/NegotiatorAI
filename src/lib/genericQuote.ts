import OpenAI from 'openai';
import type { ConversationTurn, Quote } from '@/lib/types';
import type { GeneralJobSpec } from '@/lib/verticals';

const quoteSchema = {
  type: 'object', additionalProperties: false, required: ['outcome', 'line_items', 'binding', 'valid_until', 'included_services', 'excluded_services', 'red_flags'],
  properties: {
    outcome: { type: 'string', enum: ['quote_received', 'callback_commitment', 'documented_decline'] },
    line_items: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['key', 'amount', 'evidence_turn'], properties: { key: { type: 'string' }, amount: { type: 'number' }, evidence_turn: { type: 'integer', minimum: 0 } } } },
    binding: { type: 'boolean' }, valid_until: { type: 'string' },
    included_services: { type: 'array', items: { type: 'string' } }, excluded_services: { type: 'array', items: { type: 'string' } }, red_flags: { type: 'array', items: { type: 'string' } },
  },
};

export async function normalizeGenericQuote(callId: string, companyName: string, job: GeneralJobSpec, transcript: ConversationTurn[]): Promise<Quote> {
  const allowedKeys = job.config.quoteLineItems.map((item) => item.key);
  let normalized: { outcome: Quote['outcome']; line_items: Array<{ key: string; amount: number; evidence_turn: number }>; binding: boolean; valid_until: string; included_services: string[]; excluded_services: string[]; red_flags: string[] };
  if (process.env.OPENAI_API_KEY) {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await client.responses.create({
      model: process.env.OPENAI_VERTICAL_MODEL || 'gpt-5-mini',
      input: `Normalize this vendor call into an evidence-backed quote. Use only amounts explicitly stated in the transcript. Use only these line-item keys: ${JSON.stringify(allowedKeys)}. For each line item, evidence_turn must be the zero-based transcript index that proves it. Do not infer an amount.\n\nCONFIRMED JOB: ${JSON.stringify(job.data)}\n\nTRANSCRIPT: ${JSON.stringify(transcript.map((turn, index) => ({ index, speaker: turn.speaker, text: turn.text })))} `,
      text: { format: { type: 'json_schema', name: 'normalized_quote', strict: true, schema: quoteSchema } },
    });
    normalized = JSON.parse(response.output_text);
  } else {
    const totalMatch = transcript.map((turn) => turn.text).join(' ').match(/(?:all[- ]?in|total|estimate)\D{0,30}\$?([\d,]+(?:\.\d{1,2})?)/i);
    const total = totalMatch ? Number(totalMatch[1].replace(/,/g, '')) : 0;
    normalized = { outcome: total ? 'quote_received' : 'callback_commitment', line_items: total ? [{ key: 'total', amount: total, evidence_turn: 0 }] : [], binding: false, valid_until: '', included_services: [], excluded_services: [], red_flags: ['Structured OpenAI quote normalization is not configured; review the transcript before relying on this result.'] };
  }
  const safeItems = normalized.line_items.filter((item) => allowedKeys.includes(item.key) && Number.isFinite(item.amount) && item.evidence_turn >= 0 && item.evidence_turn < transcript.length);
  const amount = (key: string) => safeItems.find((item) => item.key === key)?.amount ?? 0;
  const total = amount('total') || amount('base_price');
  return {
    quote_id: callId, company_name: companyName, company_style: 'transparent_fair', call_timestamp: new Date().toISOString(), call_duration_seconds: 0, outcome: normalized.outcome,
    quote: { base_coverage: amount('base_price'), additional_event_coverage: 0, videography: 0, drone_coverage: 0, cinematic_film: 0, highlight_reel: 0, albums: 0, travel: amount('travel_or_delivery'), accommodation: 0, taxes: amount('taxes_and_fees'), deposit: amount('deposit'), overtime_rate_per_hour: 0, other_fees: safeItems.filter((item) => !['base_price', 'travel_or_delivery', 'taxes_and_fees', 'deposit', 'total'].includes(item.key)).map((item) => ({ name: job.config.quoteLineItems.find((line) => line.key === item.key)?.label ?? item.key, amount: item.amount })), total, binding: normalized.binding, valid_until: normalized.valid_until },
    included_services: normalized.included_services, excluded_services: normalized.excluded_services, red_flags: normalized.red_flags, transcript, price_changed_during_call: false, initial_price: total, final_price: total,
  };
}
