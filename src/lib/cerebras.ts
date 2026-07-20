import OpenAI from 'openai';

const baseURL = 'https://api.cerebras.ai/v1';

export function hasCerebras(): boolean {
  return Boolean(process.env.CEREBRAS_API_KEY?.trim());
}

export function cerebrasClient(): OpenAI {
  const apiKey = process.env.CEREBRAS_API_KEY?.trim();
  if (!apiKey) throw new Error('CEREBRAS_API_KEY is not configured.');
  // Cerebras exposes an OpenAI-compatible Chat Completions endpoint.
  return new OpenAI({ apiKey, baseURL });
}

export function cerebrasModel(): string {
  return process.env.CEREBRAS_MODEL?.trim() || 'gpt-oss-120b';
}
