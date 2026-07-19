import type { ConversationState } from '@/lib/types';

const calls = new Map<string, ConversationState>();

export function saveCall(state: ConversationState): void { calls.set(state.id, state); }
export function getCall(id: string): ConversationState | undefined { return calls.get(id); }
export function updateCall(id: string, update: Partial<ConversationState>): ConversationState | undefined {
  const current = calls.get(id);
  if (!current) return undefined;
  const next = { ...current, ...update };
  calls.set(id, next);
  return next;
}
