'use client';

import { Building2, ExternalLink, LoaderCircle, Phone, Search, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generalJobStorageKey, generalVendorsStorageKey } from '@/lib/config';
import type { GeneralJobSpec } from '@/lib/verticals';

type Vendor = { place_id: string; name: string; phone_number?: string; address?: string; rating?: number; maps_url?: string; query: string };

export default function DiscoverPage() {
  const router = useRouter();
  const [job, setJob] = useState<GeneralJobSpec>();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => { const stored = localStorage.getItem(generalJobStorageKey); if (!stored) { router.replace('/intake'); return; } try { setJob(JSON.parse(stored) as GeneralJobSpec); } catch { router.replace('/intake'); } }, [router]);
  const search = async () => {
    if (!job) return;
    setLoading(true); setError(undefined);
    try {
      const response = await fetch('/api/discovery/google-places', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: job.config, values: job.data }) });
      const body = await response.json() as { vendors?: Vendor[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Could not discover businesses.');
      setVendors(body.vendors ?? []);
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Could not discover businesses.'); }
    finally { setLoading(false); }
  };
  const toggle = (vendor: Vendor) => setSelected((current) => current.includes(vendor.place_id) ? current.filter((id) => id !== vendor.place_id) : current.length === 3 ? current : [...current, vendor.place_id]);
  const continueToCalls = () => {
    const approved = vendors.filter((vendor) => selected.includes(vendor.place_id));
    if (approved.length !== 3) { toast.error('Select exactly three businesses for the live call demo.'); return; }
    localStorage.setItem(generalVendorsStorageKey, JSON.stringify(approved));
    router.push('/calls');
  };
  return <div className="mx-auto max-w-[1200px] px-6 py-10"><div><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Market discovery</p><h1 className="mt-3 text-4xl font-bold tracking-[-0.03em]">Show the market before calling it.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">Searches use the confirmed {job?.config.displayName.toLowerCase() ?? 'service'} brief. Business phone numbers and Maps sources are shown before you approve any outreach.</p></div><section className="mt-8 border border-negotiator-border bg-negotiator-surface p-6"><div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="font-semibold">Find up to 10 businesses</h2><p className="mt-1 text-sm text-slate-400">No business is called by this step.</p></div><button onClick={() => void search()} disabled={loading || !job} className="inline-flex items-center gap-2 bg-negotiator-accent px-4 py-3 text-sm font-semibold disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}Search Google Places</button></div>{error && <div className="mt-5 border border-negotiator-warning/40 bg-negotiator-warning/5 p-4 text-sm text-negotiator-warning"><p>{error}</p><p className="mt-2 text-slate-400">Add `GOOGLE_MAPS_API_KEY` to your local/Vercel environment, enable Places API (New), then try again. The app does not create fake vendor phone numbers.</p></div>}</section>{vendors.length > 0 && <><div className="mt-8 flex items-center justify-between gap-4"><div><p className="text-sm font-semibold">{vendors.length} businesses discovered</p><p className="mt-1 text-xs text-slate-400">Select three consented role-players for the live hackathon demo. Discovery evidence remains visible.</p></div><p className="text-sm text-negotiator-accent">{selected.length}/3 selected</p></div><div className="mt-5 grid gap-4 md:grid-cols-2">{vendors.map((vendor) => <article key={vendor.place_id} className={`border p-5 ${selected.includes(vendor.place_id) ? 'border-negotiator-success bg-negotiator-success/5' : 'border-negotiator-border bg-negotiator-surface'}`}><div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2"><Building2 size={16} className="text-negotiator-accent" /><h2 className="font-semibold">{vendor.name}</h2></div><p className="mt-2 text-sm text-slate-400">{vendor.address ?? 'Address not returned'}</p></div><label className="flex items-center gap-2 text-xs text-slate-300"><input type="checkbox" checked={selected.includes(vendor.place_id)} disabled={!selected.includes(vendor.place_id) && selected.length === 3} onChange={() => toggle(vendor)} />Select</label></div><div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-negotiator-border pt-4 text-sm"><span className="inline-flex items-center gap-2 text-slate-300"><Phone size={14} className="text-negotiator-success" />{vendor.phone_number ?? 'No callable business number'}</span>{vendor.rating && <span className="text-slate-400">Rating {vendor.rating}</span>}{vendor.maps_url && <a href={vendor.maps_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-negotiator-accent">Maps source <ExternalLink size={13} /></a>}</div><p className="mt-3 text-[11px] text-slate-500">Source query: {vendor.query}</p></article>)}</div><section className="mt-8 flex flex-wrap items-center justify-between gap-4 border border-negotiator-success/40 bg-negotiator-success/5 p-5"><div className="flex gap-3"><ShieldCheck className="mt-0.5 text-negotiator-success" size={18} /><p className="max-w-xl text-sm text-slate-300">For the demo, replace the selected business numbers with consented role-player numbers before batch calling. Never use this screen to call real businesses without customer authorization.</p></div><button onClick={continueToCalls} className="bg-negotiator-success px-4 py-3 text-sm font-semibold text-negotiator-bg">Approve three and prepare calls</button></section></>}</div>;
}
