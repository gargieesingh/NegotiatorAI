'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, LoaderCircle, PhoneCall, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { CallGrid } from '@/components/calls/CallGrid';
import { StepProgress } from '@/components/layout/StepProgress';
import { demoVendorRoles, generalJobStorageKey, generalVendorsStorageKey, jobSpecStorageKey, quotesStorageKey } from '@/lib/config';
import type { CallJobSpec, ConversationState, DemoVendorParticipant, JobSpec, Quote } from '@/lib/types';
import type { GeneralJobSpec } from '@/lib/verticals';

function createCall(jobSpec: CallJobSpec, role: { id: string; vendor_name: string; vendor_style: DemoVendorParticipant['vendor_style'] }): ConversationState {
  const vendor: DemoVendorParticipant = { ...role, phone_number: '', consent_recording: false };
  return { id: crypto.randomUUID(), vendor, status: 'initiated', job_spec: jobSpec, mode: 'quote', started_at: new Date().toISOString() };
}

export default function CallsPage() {
  const router = useRouter();
  const [calls, setCalls] = useState<ConversationState[]>();
  const [batchStarted, setBatchStarted] = useState(false);
  const notifiedReady = useRef(false);

  useEffect(() => {
    const generalStored = localStorage.getItem(generalJobStorageKey);
    if (generalStored) {
      try {
        const jobSpec = JSON.parse(generalStored) as GeneralJobSpec;
        if (!jobSpec.confirmed_by_user) throw new Error('unconfirmed');
        const discovered = JSON.parse(localStorage.getItem(generalVendorsStorageKey) ?? '[]') as Array<{ place_id: string; name: string }>;
        const roles = (discovered.length === 3 ? discovered : demoVendorRoles).map((vendor, index) => ({ id: 'place_id' in vendor ? vendor.place_id : vendor.id, vendor_name: 'name' in vendor ? vendor.name : vendor.vendor_name, vendor_style: (index === 0 ? 'premium_negotiable' : index === 1 ? 'lowball_upseller' : 'transparent_fair') as DemoVendorParticipant['vendor_style'] }));
        setCalls(roles.map((role) => createCall(jobSpec, role)));
        return;
      } catch { toast.error('Your saved general brief could not be read.'); router.replace('/intake'); return; }
    }
    const stored = localStorage.getItem(jobSpecStorageKey);
    if (!stored) { router.replace('/intake'); return; }
    try {
      const jobSpec = JSON.parse(stored) as JobSpec;
      if (!jobSpec.confirmed_by_user) { router.replace('/intake'); return; }
      setCalls(demoVendorRoles.map((role) => createCall(jobSpec, role)));
    } catch { toast.error('Your saved wedding brief could not be read.'); router.replace('/intake'); }
  }, [router]);

  useEffect(() => {
    if (!calls?.some((call) => call.status === 'calling')) return;
    const timer = window.setInterval(async () => {
      const active = calls.filter((call) => call.status === 'calling');
      const updates = await Promise.all(active.map(async (call) => {
        const response = await fetch(`/api/calls/${call.id}/status`, { cache: 'no-store' });
        return response.ok ? await response.json() as { status: ConversationState['status']; quote?: Quote; transcript?: ConversationState['transcript']; error?: string } : null;
      }));
      setCalls((current) => current?.map((call) => {
        const update = updates[active.findIndex((item) => item.id === call.id)];
        return update ? { ...call, status: update.status, quote: update.quote, transcript: update.transcript, error: update.error } : call;
      }));
    }, 2500);
    return () => window.clearInterval(timer);
  }, [calls]);

  useEffect(() => {
    const quotes = calls?.flatMap((call) => call.quote ? [call.quote] : []) ?? [];
    if (quotes.length) localStorage.setItem(quotesStorageKey, JSON.stringify(quotes));
    if (quotes.length >= 2 && !notifiedReady.current) {
      notifiedReady.current = true;
      toast.success('Quotes captured. You can now compare prices and prepare the leverage call.');
    }
  }, [calls]);

  const updateVendor = (id: string, field: 'phone_number' | 'consent_recording', value: string | boolean) => {
    setCalls((current) => current?.map((call) => call.vendor.id === id ? { ...call, vendor: { ...call.vendor, [field]: value } } : call));
  };

  const startBatch = async () => {
    if (!calls || calls.some((call) => !call.vendor.phone_number || !call.vendor.consent_recording)) {
      toast.error('Add each participant phone number and confirm recording consent first.');
      return;
    }
    setBatchStarted(true);
    await Promise.all(calls.map(async (call) => {
      try {
        setCalls((current) => current?.map((item) => item.id === call.id ? { ...item, status: 'calling', error: undefined } : item));
        const response = await fetch('/api/calls/initiate', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vendor: call.vendor, job_spec: call.job_spec, mode: 'quote' }),
        });
        const body = await response.json() as { conversation_id?: string; error?: string };
        if (!response.ok || !body.conversation_id) throw new Error(body.error ?? 'Could not start call');
        setCalls((current) => current?.map((item) => item.id === call.id ? { ...item, id: body.conversation_id!, status: 'calling' } : item));
      } catch (error) {
        setCalls((current) => current?.map((item) => item.id === call.id ? { ...item, status: 'error', error: error instanceof Error ? error.message : 'Could not start live call' } : item));
      }
    }));
    toast.message('Batch launched: the three consented participants are being called in parallel.');
  };

  const received = calls?.filter((call) => call.quote?.outcome === 'quote_received').length ?? 0;
  const verticalName = calls && 'config' in calls[0].job_spec ? calls[0].job_spec.config.displayName : 'wedding photography';
  return <div className="mx-auto max-w-[1200px] px-6 py-10"><StepProgress current={2} /><div className="mt-10"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Module 02 / The Caller</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">Call three {verticalName} vendors with one locked brief.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">This is a true parallel batch: all three consented demo participants receive the same immutable brief. After each call ends, its structured quote and transcript are captured for comparison.</p></div>{calls ? <><section className="mt-8 border border-negotiator-border bg-negotiator-surface p-5"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 text-negotiator-success" size={18} /><div><h2 className="font-semibold">Live demo participant setup</h2><p className="mt-1 text-sm text-slate-400">Enter only consented human role-player numbers. The agent thanks and ends each call after collecting a quote; it does not speak application JSON to the participant.</p></div></div><div className="mt-5 grid gap-3 md:grid-cols-3">{calls.map((call) => <div key={call.id} className="border border-negotiator-border bg-negotiator-surface-2 p-3"><p className="text-sm font-semibold">{call.vendor.vendor_name}</p><p className="mt-1 text-[10px] uppercase tracking-[0.08em] text-slate-500">{call.vendor.vendor_style.replace('_', ' ')}</p><label className="mt-3 block text-xs text-slate-400">Participant phone number<input disabled={batchStarted} className="mt-1 w-full border border-negotiator-border bg-negotiator-bg p-2 text-sm text-slate-100 outline-none focus:border-negotiator-accent disabled:opacity-60" placeholder="+1..." value={call.vendor.phone_number} onChange={(event) => updateVendor(call.vendor.id, 'phone_number', event.target.value)} /></label><label className="mt-3 flex items-center gap-2 text-xs text-slate-300"><input disabled={batchStarted} type="checkbox" checked={call.vendor.consent_recording} onChange={(event) => updateVendor(call.vendor.id, 'consent_recording', event.target.checked)} />Recording consent confirmed</label></div>)}</div><button disabled={batchStarted} onClick={() => void startBatch()} className="mt-5 inline-flex items-center gap-2 bg-negotiator-accent px-4 py-3 text-sm font-semibold disabled:opacity-60"><PhoneCall size={16} />{batchStarted ? 'Batch calls in progress' : 'Start 3 calls in parallel'}</button></section><div className="mt-8"><CallGrid calls={calls} /></div>{received >= 2 && <section className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-negotiator-success/40 bg-negotiator-success/5 p-5"><div><p className="text-sm font-semibold">{received} itemized quotes are ready to compare</p><p className="mt-1 text-sm text-slate-400">The next step chooses verified leverage; it never invents a competing offer.</p></div><button onClick={() => router.push('/negotiate')} className="inline-flex items-center gap-2 bg-negotiator-success px-4 py-3 text-sm font-semibold text-negotiator-bg">Compare and prepare negotiation <ArrowRight size={16} /></button></section>}</> : <div className="mt-20 flex items-center gap-3 text-slate-400"><LoaderCircle className="animate-spin" />Loading confirmed brief...</div>}</div>;
}
