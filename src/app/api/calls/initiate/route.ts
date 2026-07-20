import { NextRequest, NextResponse } from 'next/server';
import { placeHumanDemoCall } from '@/lib/elevenlabs';
import { saveCall, updateCall } from '@/lib/callStore';
import type { CallJobSpec, ConversationState, DemoVendorParticipant } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { vendor?: DemoVendorParticipant; job_spec?: CallJobSpec; mode?: 'quote' | 'negotiate'; leverage?: ConversationState['leverage'] };
    if (!body.vendor || !body.job_spec || !body.mode) return NextResponse.json({ error: 'vendor, job_spec, and mode are required' }, { status: 400 });
    if (!body.job_spec.confirmed_by_user || !body.job_spec.spec_hash) return NextResponse.json({ error: 'A confirmed immutable job brief is required before calling.' }, { status: 400 });
    const callId = crypto.randomUUID();
    // Persist before asking ElevenLabs to dial. A fast participant can finish before
    // the outbound-call API responds, and its post-call webhook must find this record.
    const state: ConversationState = { id: callId, vendor: body.vendor, status: 'calling', job_spec: body.job_spec, mode: body.mode, leverage: body.leverage, started_at: new Date().toISOString() };
    saveCall(state);
    try {
      const callSid = await placeHumanDemoCall(body.vendor, body.job_spec, callId, body.mode, body.leverage);
      return NextResponse.json({ conversation_id: callId, call_sid: callSid, status: state.status, vendor_name: body.vendor.vendor_name, spec_hash: body.job_spec.spec_hash });
    } catch (error) {
      updateCall(callId, { status: 'error', error: error instanceof Error ? error.message : 'Failed to initiate live call' });
      throw error;
    }
  } catch (error) {
    console.error('Failed to initiate live call', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to initiate live call' }, { status: 500 });
  }
}
