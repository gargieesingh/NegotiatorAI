import Anthropic from '@anthropic-ai/sdk';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const envFile = join(projectRoot, '.env.local');

// `node script.mjs` does not load Next.js environment files automatically.
// Load the project's .env.local without printing its contents.
if (!process.env.ANTHROPIC_API_KEY && existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
const model = process.env.ANTHROPIC_TEST_MODEL?.trim() || 'claude-haiku-4-5-20251001';

if (!apiKey) {
  console.error('ANTHROPIC_API_KEY is not set. Add it to .env.local and run this command again.');
  process.exit(1);
}

try {
  const client = new Anthropic({ apiKey });
  const response = await client.messages.create({
    model,
    max_tokens: 12,
    messages: [{ role: 'user', content: 'Reply with exactly: API key works' }],
  });

  const text = response.content.find((item) => item.type === 'text')?.text ?? '(No text returned)';
  console.log('Anthropic API request succeeded.');
  console.log(`Model: ${response.model}`);
  console.log(`Response: ${text}`);
} catch (error) {
  const status = typeof error === 'object' && error !== null && 'status' in error
    ? String(error.status)
    : 'unknown';
  const message = error instanceof Error ? error.message : String(error);

  console.error(`Anthropic API request failed (HTTP ${status}).`);
  console.error(message);

  if (status === '401') console.error('The API key is invalid, expired, or not being read from .env.local.');
  if (status === '403') console.error('The key was recognized but does not have permission for this request.');
  if (status === '404') console.error(`The key may be valid, but the model "${model}" may not be available to this account. Set ANTHROPIC_TEST_MODEL to an enabled model and retry.`);
  if (status === '429') console.error('The key may be valid, but the account has reached a rate, spend, or credit limit.');
  process.exit(1);
}
