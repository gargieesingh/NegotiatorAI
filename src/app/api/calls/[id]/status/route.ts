import { NextRequest, NextResponse } from 'next/server';
import { getCall } from '@/lib/callStore';

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const state = getCall(params.id);
  if (!state) return NextResponse.json({ error: 'Call not found' }, { status: 404 });
  return NextResponse.json({ conversation_id: state.id, status: state.status, vendor_name: state.vendor.vendor_name, quote: state.quote, transcript: state.transcript, error: state.error });
}
