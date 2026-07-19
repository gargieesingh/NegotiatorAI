import { NextRequest, NextResponse } from 'next/server';
import { generateReport } from '@/lib/claude';
import type { JobSpec, NegotiationResult, Quote } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { job_spec?: JobSpec; quotes?: Quote[]; negotiation_result?: NegotiationResult };
    if (!body.job_spec || !body.quotes || !body.negotiation_result) return NextResponse.json({ error: 'job_spec, quotes, and negotiation_result are required' }, { status: 400 });
    const report = await generateReport(body.quotes, body.negotiation_result, body.job_spec);
    return NextResponse.json({ report });
  } catch (error) {
    console.error('Report generation failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not generate report' }, { status: 500 });
  }
}
