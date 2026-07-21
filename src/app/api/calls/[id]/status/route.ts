import { NextRequest, NextResponse } from 'next/server';
import { getCall, updateCall } from '@/lib/callStore';

async function reconcileTwilioStatus(id: string) {
  const state = await getCall(id);
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  if (!state || !state.call_sid || !accountSid || !authToken || !['calling', 'processing'].includes(state.status)) return state;

  try {
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls/${state.call_sid}.json`, {
      headers: { Authorization: `Basic ${credentials}` },
      cache: 'no-store',
    });
    if (!response.ok) return state;
    const call = await response.json() as { status?: string };
    if (call.status === 'busy' || call.status === 'no-answer') {
      return await updateCall(id, { status: 'no_answer', error: `Call was not picked up (${call.status}).`, completed_at: new Date().toISOString() }) ?? state;
    }
    if (call.status === 'failed' || call.status === 'canceled') {
      return await updateCall(id, { status: 'error', error: `Telephony call ${call.status}.`, completed_at: new Date().toISOString() }) ?? state;
    }
    if (call.status === 'completed' && state.status === 'calling') {
      return await updateCall(id, { status: 'processing' }) ?? state;
    }
  } catch {
    // The ElevenLabs webhook remains the source of transcript and quote data.
  }
  return state;
}

export async function GET(_: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const state = await reconcileTwilioStatus(params.id);
  if (!state) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
  return NextResponse.json({ conversation_id: state.id, status: state.status, vendor_name: state.vendor.vendor_name, quote: state.quote, transcript: state.transcript, error: state.error });
}
