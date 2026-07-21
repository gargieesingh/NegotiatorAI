'use client';

import { Building2, ExternalLink, LoaderCircle, Phone, Search, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { generalJobStorageKey, generalVendorsStorageKey } from '@/lib/config';
import type { GeneralJobSpec } from '@/lib/verticals';

type Vendor = {
  place_id: string;
  name: string;
  phone_number?: string;
  address?: string;
  rating?: number;
  maps_url?: string;
  query: string;
};

export default function DiscoverPage() {
  const router = useRouter();
  const [job, setJob] = useState<GeneralJobSpec>();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const stored = localStorage.getItem(generalJobStorageKey);
    if (!stored) {
      router.replace('/intake');
      return;
    }
    try {
      setJob(JSON.parse(stored) as GeneralJobSpec);
    } catch {
      router.replace('/intake');
    }
  }, [router]);

  const search = async () => {
    if (!job) return;
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch('/api/discovery/google-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: job.config, values: job.data }),
      });
      const body = (await response.json()) as { vendors?: Vendor[]; error?: string };
      if (!response.ok) throw new Error(body.error ?? 'Could not discover businesses.');
      setVendors(body.vendors ?? []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not discover businesses.');
    } finally {
      setLoading(false);
    }
  };

  const toggle = (vendor: Vendor) =>
    setSelected((current) =>
      current.includes(vendor.place_id)
        ? current.filter((id) => id !== vendor.place_id)
        : current.length === 3
        ? current
        : [...current, vendor.place_id]
    );

  const continueToCalls = () => {
    const approved = vendors.filter((vendor) => selected.includes(vendor.place_id));
    if (approved.length !== 3) {
      toast.error('Select exactly three businesses for the live call demo.');
      return;
    }
    localStorage.setItem(generalVendorsStorageKey, JSON.stringify(approved));
    router.push('/calls');
  };

  return (
    <div className="mx-auto max-w-[1200px] px-6 py-10">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-600">
          Market discovery
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-[-0.03em] text-strong-950">
          Show the market before calling it.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-sub-600">
          Searches use the confirmed {job?.config.displayName.toLowerCase() ?? 'service'} brief. Business phone numbers and Maps sources are shown before you approve any outreach.
        </p>
      </div>

      <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-strong-950">Find up to 10 businesses</h2>
            <p className="mt-1 text-sm text-sub-600">No business is called by this step.</p>
          </div>
          <button
            onClick={() => void search()}
            disabled={loading || !job}
            className="inline-flex items-center gap-2 rounded-xl bg-strong-950 px-4 py-3 text-sm font-semibold text-white-0 transition-colors hover:bg-strong-950/90 disabled:opacity-60 cursor-pointer"
          >
            {loading ? <LoaderCircle size={16} className="animate-spin" /> : <Search size={16} />}
            Search Google Places
          </button>
        </div>

        {error && (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p className="font-medium">{error}</p>
            <p className="mt-2 text-sub-600">
              Add `GOOGLE_MAPS_API_KEY` to your local/Vercel environment, enable Places API (New), then try again. The app does not create fake vendor phone numbers.
            </p>
          </div>
        )}
      </section>

      {vendors.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-strong-950">
                {vendors.length} businesses discovered
              </p>
              <p className="mt-1 text-xs text-sub-600">
                Select three consented role-players for the live hackathon demo. Discovery evidence remains visible.
              </p>
            </div>
            <p className="text-sm font-semibold text-blue-600">{selected.length}/3 selected</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {vendors.map((vendor) => {
              const isSelected = selected.includes(vendor.place_id);
              return (
                <article
                  key={vendor.place_id}
                  className={`rounded-2xl border p-5 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] transition-all ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/40 shadow-[0_0_1.25rem_0_rgba(59,130,246,0.08)]'
                      : 'border-stroke-soft-200 bg-white-0 hover:border-stroke-sub-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-blue-600" />
                        <h2 className="font-semibold text-strong-950">{vendor.name}</h2>
                      </div>
                      <p className="mt-2 text-sm text-sub-600">
                        {vendor.address ?? 'Address not returned'}
                      </p>
                    </div>
                    <label className="flex items-center gap-2 text-xs font-medium text-sub-600 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        disabled={!isSelected && selected.length === 3}
                        onChange={() => toggle(vendor)}
                        className="rounded border-stroke-soft-200 text-blue-600 focus:ring-blue-500"
                      />
                      Select
                    </label>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-stroke-soft-200 pt-4 text-sm">
                    <span className="inline-flex items-center gap-2 font-medium text-strong-950">
                      <Phone size={14} className="text-green-600" />
                      {vendor.phone_number ?? 'No callable business number'}
                    </span>
                    {vendor.rating && (
                      <span className="text-sub-600">Rating {vendor.rating}</span>
                    )}
                    {vendor.maps_url && (
                      <a
                        href={vendor.maps_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Maps source <ExternalLink size={13} />
                      </a>
                    )}
                  </div>

                  <p className="mt-3 text-[11px] text-sub-600/70">
                    Source query: {vendor.query}
                  </p>
                </article>
              );
            })}
          </div>

          <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 text-green-600 shrink-0" size={20} />
              <p className="max-w-xl text-sm leading-relaxed text-sub-600">
                For the demo, replace the selected business numbers with consented role-player numbers before batch calling. Never use this screen to call real businesses without customer authorization.
              </p>
            </div>
            <button
              onClick={continueToCalls}
              className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white-0 transition-colors hover:bg-green-700 shadow-sm cursor-pointer"
            >
              Approve three and prepare calls
            </button>
          </section>
        </>
      )}
    </div>
  );
}

