import Anthropic from '@anthropic-ai/sdk';
import type { JobSpec, NegotiationResult, Quote, Report } from '@/lib/types';

function client(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not configured.');
  return new Anthropic({ apiKey });
}

function parseJson(text: string): unknown {
  return JSON.parse(text.replace(/```json|```/g, '').trim()) as unknown;
}

function textResponse(content: Anthropic.ContentBlock[]): string {
  const block = content.find((item): item is Anthropic.TextBlock => item.type === 'text');
  if (!block) throw new Error('Claude did not return text content.');
  return block.text;
}

export async function generateReport(quotes: Quote[], negotiationResult: NegotiationResult, jobSpec: any): Promise<Report> {
  const verticalName = jobSpec?.vertical?.replace('_', ' ') || jobSpec?.config?.displayName || 'service procurement';
  const response = await client().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a consumer advocate analyzing ${verticalName} quotes for a client. Return only JSON matching this exact report shape: { generated_at: string, summary: string, ranked_quotes: Array<{ quote_id: string, rank: number, company_name: string, price: number, pros: string[], cons: string[] }>, negotiation_summary: string, recommendation: string, red_flags_found: string[] }. Rank transparent, binding, itemized bids with complete requested scope above incomplete or suspicious lowball offers. Cite only transcript text present in the supplied data. Never invent a quote, inclusion, transcript, or price.\n\nCONFIRMED JOB BRIEF:\n${JSON.stringify(jobSpec)}\n\nQUOTES:\n${JSON.stringify(quotes)}\n\nNEGOTIATION RESULT:\n${JSON.stringify(negotiationResult)}`,
    }],
  });
  return parseJson(textResponse(response.content)) as Report;
}
