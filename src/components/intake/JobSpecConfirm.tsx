'use client';

import { ArrowRight, Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { JobSpec, WeddingEvent } from '@/lib/types';
import { createSpecHash, generateId } from '@/lib/utils';

interface JobSpecConfirmProps { spec: Partial<JobSpec>; onConfirm: (spec: JobSpec) => void; }

const fields: Array<{ key: keyof JobSpec; label: string }> = [
  { key: 'wedding_date', label: 'Wedding date' },
  { key: 'venue', label: 'Venue and city' },
  { key: 'events', label: 'Events and coverage hours' },
  { key: 'coverage_type', label: 'Photography service' },
  { key: 'drone_coverage_required', label: 'Drone coverage' },
  { key: 'albums_required', label: 'Albums' },
  { key: 'special_requests', label: 'Special requests' },
];

function displayValue(value: JobSpec[keyof JobSpec] | undefined, key: keyof JobSpec): string {
  if (value === undefined || value === null || value === '') return 'Missing';
  if (typeof value === 'boolean') return value ? 'Required' : 'Not required';
  if (Array.isArray(value)) {
    if (key === 'events') return value.length ? (value as WeddingEvent[]).map((event) => `${event.name} (${event.coverage_hours || '?'}h)`).join(', ') : 'Missing';
    return value.length ? value.join(', ') : 'None';
  }
  if (typeof value === 'object') { const venue = value as JobSpec['venue']; return `${venue.name || 'Missing'}, ${venue.city || 'Missing'}`; }
  if (key === 'coverage_type') return value === 'photography_plus_videography' ? 'Photography + videography' : 'Photography only';
  return String(value);
}

function parseEvents(text: string): WeddingEvent[] {
  return text.split(',').map((entry) => {
    const match = entry.trim().match(/(.+?)(?:\s*\(?\s*(\d+)h\s*\)?)?$/i);
    return { name: match?.[1]?.trim() || entry.trim(), coverage_hours: Number(match?.[2] ?? 0) };
  }).filter((event) => event.name.length > 0);
}

export function JobSpecConfirm({ spec, onConfirm }: JobSpecConfirmProps) {
  const [draft, setDraft] = useState<Partial<JobSpec>>(spec);
  const [editing, setEditing] = useState<keyof JobSpec>();
  const missing = useMemo(() => fields.filter(({ key }) => displayValue(draft[key], key) === 'Missing').length, [draft]);
  const updateText = (key: keyof JobSpec, text: string) => {
    if (key === 'venue') { const [name = '', city = ''] = text.split(',').map((part) => part.trim()); setDraft((current) => ({ ...current, venue: { name, city } })); return; }
    if (key === 'events') { setDraft((current) => ({ ...current, events: parseEvents(text) })); return; }
    if (key === 'special_requests') { setDraft((current) => ({ ...current, special_requests: text.split(',').map((item) => item.trim()).filter(Boolean) })); return; }
    if (key === 'coverage_type') { setDraft((current) => ({ ...current, coverage_type: text.toLowerCase().includes('video') ? 'photography_plus_videography' : 'photography_only' })); return; }
    setDraft((current) => ({ ...current, [key]: text }));
  };
  const confirm = () => {
    const brief = { vertical: 'wedding_photography' as const, wedding_date: draft.wedding_date ?? '', venue: draft.venue ?? { name: '', city: '' }, events: draft.events ?? [], coverage_type: draft.coverage_type ?? 'photography_only' as const, drone_coverage_required: draft.drone_coverage_required ?? false, albums_required: draft.albums_required ?? false, special_requests: draft.special_requests ?? [] };
    onConfirm({ ...brief, id: generateId(), created_at: new Date().toISOString(), intake_method: draft.intake_method ?? 'voice', confirmed_by_user: true, confirmed_at: new Date().toISOString(), spec_hash: createSpecHash(brief) });
  };
  return <section className="mt-8 border border-negotiator-accent bg-negotiator-surface p-6"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Current confirmed wedding brief</p><h2 className="mt-2 text-2xl font-semibold">Confirm your photography brief</h2></div><p className={`text-xs ${missing ? 'text-negotiator-warning' : 'text-negotiator-success'}`}>{missing ? `${missing} fields need attention` : 'Brief ready for quotes'}</p></div><div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-2">{fields.map(({ key, label }) => <div key={key} className="border-b border-negotiator-border pb-3"><div className="flex items-center justify-between"><p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p><button onClick={() => setEditing(key)} className="text-slate-500 hover:text-negotiator-accent" aria-label={`Edit ${label}`}><Pencil size={13} /></button></div>{editing === key ? <input autoFocus className="mt-2 w-full border border-negotiator-accent bg-negotiator-surface-2 p-2 text-sm outline-none" defaultValue={displayValue(draft[key], key)} onBlur={(event) => { updateText(key, event.target.value); setEditing(undefined); }} onKeyDown={(event) => { if (event.key === 'Enter') event.currentTarget.blur(); }} /> : <p className={`mt-1 text-sm ${displayValue(draft[key], key) === 'Missing' ? 'text-negotiator-warning' : 'text-slate-200'}`}>{displayValue(draft[key], key)}</p>}</div>)}</div><button onClick={confirm} className="mt-8 inline-flex items-center gap-2 bg-negotiator-success px-5 py-3 text-sm font-semibold text-negotiator-bg hover:bg-emerald-400">Confirm and start calling <ArrowRight size={16} /></button></section>;
}
