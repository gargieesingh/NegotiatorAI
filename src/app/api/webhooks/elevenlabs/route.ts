import { NextRequest, NextResponse } from 'next/server';
import { getCall, updateCall } from '@/lib/callStore';
import type { ConversationTurn, Quote, WeddingPhotoQuoteDetails } from '@/lib/types';
import { normalizeGenericQuote } from '@/lib/genericQuote';

type UnknownRecord = Record<string, unknown>;

function record(value: unknown): UnknownRecord {
  return typeof value === 'object' && value !== null ? value as UnknownRecord : {};
}

function extractedValue(collection: UnknownRecord, key: string): unknown {
  const item = collection[key];
  if (typeof item !== 'object' || item === null) return item;
  const entry = item as UnknownRecord;
  return entry.value ?? entry.result ?? entry.data ?? item;
}

function numberValue(collection: UnknownRecord, key: string): number {
  const value = extractedValue(collection, key);
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function booleanValue(collection: UnknownRecord, key: string): boolean {
  const value = extractedValue(collection, key);
  return value === true || value === 'true' || value === 'yes';
}

function listValue(collection: UnknownRecord, key: string): string[] {
  const value = extractedValue(collection, key);
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  return typeof value === 'string' ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function transcriptTurns(rawTranscript: unknown): ConversationTurn[] {
  if (!Array.isArray(rawTranscript)) return [];
  return rawTranscript.map((turn, index) => {
    const item = record(turn);
    return {
      speaker: (item.role === 'agent' ? 'negotiator' : 'company') as ConversationTurn['speaker'],
      text: String(item.message ?? ''),
      timestamp: String(item.time_in_call_secs ?? index),
      is_key_moment: false,
    };
  }).filter((turn) => turn.text.length > 0);
}

function quoteFromAnalysis(callId: string, companyName: string, analysis: UnknownRecord, transcript: ConversationTurn[]): Quote {
  const collection = record(analysis.data_collection_results);
  const details: WeddingPhotoQuoteDetails = {
    base_coverage: numberValue(collection, 'base_coverage'),
    additional_event_coverage: numberValue(collection, 'additional_event_coverage'),
    videography: numberValue(collection, 'videography'),
    drone_coverage: numberValue(collection, 'drone_coverage'),
    cinematic_film: numberValue(collection, 'cinematic_film'),
    highlight_reel: numberValue(collection, 'highlight_reel'),
    albums: numberValue(collection, 'albums'),
    travel: numberValue(collection, 'travel'),
    accommodation: numberValue(collection, 'accommodation'),
    taxes: numberValue(collection, 'taxes'),
    deposit: numberValue(collection, 'deposit'),
    overtime_rate_per_hour: numberValue(collection, 'overtime_rate_per_hour'),
    other_fees: [],
    total: numberValue(collection, 'total'),
    binding: booleanValue(collection, 'binding'),
    valid_until: String(extractedValue(collection, 'valid_until') ?? ''),
  };
  const outcomeValue = String(extractedValue(collection, 'outcome') ?? 'quote_received');
  const outcome = outcomeValue === 'callback_commitment' || outcomeValue === 'documented_decline' ? outcomeValue : 'quote_received';
  return {
    quote_id: callId,
    company_name: companyName,
    company_style: 'transparent_fair',
    call_timestamp: new Date().toISOString(),
    call_duration_seconds: 0,
    outcome,
    quote: details,
    included_services: listValue(collection, 'included_services'),
    excluded_services: listValue(collection, 'excluded_services'),
    red_flags: listValue(collection, 'red_flags'),
    transcript,
    price_changed_during_call: false,
    initial_price: details.total,
    final_price: details.total,
  };
}

export async function POST(request: NextRequest) {
  try {
    const event = await request.json() as UnknownRecord;
    if (event.type !== 'post_call_transcription') return NextResponse.json({ received: true });
    const data = record(event.data);
    const initiation = record(data.conversation_initiation_client_data);
    const variables = record(initiation.dynamic_variables);
    const callId = typeof variables.negotiator_call_id === 'string' ? variables.negotiator_call_id : '';
    const call = callId ? getCall(callId) : undefined;
    if (!call) return NextResponse.json({ received: true, matched: false });

    const transcript = transcriptTurns(data.transcript);
    const quote = 'config' in call.job_spec
      ? await normalizeGenericQuote(call.id, call.vendor.vendor_name, call.job_spec, transcript)
      : quoteFromAnalysis(call.id, call.vendor.vendor_name, record(data.analysis), transcript);
    quote.company_style = call.vendor.vendor_style;
    const status = quote.outcome === 'documented_decline' ? 'declined' : 'complete';
    updateCall(call.id, { status, quote, transcript, completed_at: new Date().toISOString() });
    return NextResponse.json({ received: true, matched: true });
  } catch (error) {
    console.error('ElevenLabs webhook processing failed', error);
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }
}
