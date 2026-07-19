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

export async function generateReport(quotes: Quote[], negotiationResult: NegotiationResult, jobSpec: JobSpec): Promise<Report> {
  const response = await client().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2000,
    messages: [{
      role: 'user',
      content: `You are a consumer advocate analyzing wedding-photography quotes. Return only JSON matching this exact report shape: { generated_at, summary, ranked_quotes, negotiation_summary, recommendation, red_flags_found }. Rank transparent, binding, itemized packages with complete requested event coverage above incomplete or suspicious low offers. Cite only transcript text present in the supplied data. Never invent a quote, inclusion, transcript, or price.\n\nCONFIRMED WEDDING BRIEF:\n${JSON.stringify(jobSpec)}\n\nQUOTES:\n${JSON.stringify(quotes)}\n\nNEGOTIATION:\n${JSON.stringify(negotiationResult)}`,
    }],
  });
  return parseJson(textResponse(response.content)) as Report;
}
