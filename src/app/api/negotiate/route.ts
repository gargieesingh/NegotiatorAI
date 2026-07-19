import { NextRequest, NextResponse } from 'next/server';
import { selectWeddingNegotiationStrategy } from '@/lib/negotiation';
import type { JobSpec, Quote } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { quotes?: Quote[]; job_spec?: JobSpec };
    if (!body.quotes || !body.job_spec) return NextResponse.json({ error: 'quotes and job_spec are required' }, { status: 400 });
    if (!body.job_spec.confirmed_by_user || !body.job_spec.spec_hash) return NextResponse.json({ error: 'A confirmed wedding brief is required.' }, { status: 400 });
    const strategy = selectWeddingNegotiationStrategy(body.quotes);
    if (!strategy) return NextResponse.json({ error: 'At least two valid, completed, comparable quotes are required before negotiation.' }, { status: 422 });
    return NextResponse.json({ strategy });
  } catch (error) {
    console.error('Negotiation strategy failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not create negotiation strategy' }, { status: 500 });
  }
}
