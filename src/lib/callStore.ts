import type { ConversationState } from '@/lib/types';

const calls = new Map<string, ConversationState>();
const prefix = 'negotiator:call:';
const providerPrefix = 'negotiator:provider:';
const ttlSeconds = 60 * 60 * 24;

function kvConfigured(): boolean {
  return Boolean(kvUrl() && kvToken());
}

function kvUrl(): string | undefined {
  return process.env.KV_REST_API_URL
    ?? process.env.UPSTASH_REDIS_REST_URL
    ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_URL;
}

function kvToken(): string | undefined {
  return process.env.KV_REST_API_TOKEN
    ?? process.env.UPSTASH_REDIS_REST_TOKEN
    ?? process.env.UPSTASH_REDIS_REST_KV_REST_API_TOKEN;
}

async function kvCommand(command: string[]): Promise<unknown> {
  const response = await fetch(`${kvUrl()}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${kvToken()}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([command]),
  });
  if (!response.ok) throw new Error(`Vercel KV returned ${response.status}.`);
  const body = await response.json() as Array<{ result?: unknown; error?: string }>;
  if (body[0]?.error) throw new Error(body[0].error);
  return body[0]?.result;
}

export async function saveCall(state: ConversationState): Promise<void> {
  calls.set(state.id, state);
  if (kvConfigured()) {
    await kvCommand(['SET', `${prefix}${state.id}`, JSON.stringify(state), 'EX', String(ttlSeconds)]);
    for (const providerId of [state.call_sid, state.elevenlabs_conversation_id].filter(Boolean) as string[]) {
      await kvCommand(['SET', `${providerPrefix}${providerId}`, state.id, 'EX', String(ttlSeconds)]);
    }
  }
}

export async function getCall(id: string): Promise<ConversationState | undefined> {
  if (kvConfigured()) {
    const result = await kvCommand(['GET', `${prefix}${id}`]);
    if (typeof result === 'string') return JSON.parse(result) as ConversationState;
  }
  return calls.get(id);
}

export async function updateCall(id: string, update: Partial<ConversationState>): Promise<ConversationState | undefined> {
  const current = await getCall(id);
  if (!current) return undefined;
  const next = { ...current, ...update };
  await saveCall(next);
  return next;
}

export async function getCallByProviderId(providerId: string): Promise<ConversationState | undefined> {
  if (!providerId) return undefined;
  if (kvConfigured()) {
    const callId = await kvCommand(['GET', `${providerPrefix}${providerId}`]);
    if (typeof callId === 'string') return getCall(callId);
  }
  return [...calls.values()].find((call) => call.call_sid === providerId || call.elevenlabs_conversation_id === providerId);
}
