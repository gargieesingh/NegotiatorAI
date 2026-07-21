'use client';

import { LoaderCircle, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { DocumentUpload } from '@/components/intake/DocumentUpload';
import { GenericBriefForm } from '@/components/intake/GenericBriefForm';
import { GenericDocumentUpload } from '@/components/intake/GenericDocumentUpload';
import { GenericVoiceIntake } from '@/components/intake/GenericVoiceIntake';
import { JobSpecConfirm } from '@/components/intake/JobSpecConfirm';
import { VoiceIntake } from '@/components/intake/VoiceIntake';
import { generalJobStorageKey, jobSpecStorageKey } from '@/lib/config';
import type { JobSpec } from '@/lib/types';
import type { GeneralJobSpec, VerticalConfig } from '@/lib/verticals';

const examples = ['I need to move a two-bedroom apartment in Charlotte.', 'I need wedding photographers for events in Delhi.', 'My car needs a repair estimate in Austin.', 'I need contractor bids for a kitchen remodel.'];

export default function IntakePage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState<VerticalConfig>();
  const [classification, setClassification] = useState<{ confidence: number; reason: string; source: string }>();
  const [loading, setLoading] = useState(false);
  const [spec, setSpec] = useState<Partial<JobSpec>>();
  const [genericValues, setGenericValues] = useState<Record<string, string | number | boolean>>();
  const receiveGenericValues = (incoming: Record<string, string | number | boolean>) => setGenericValues((current) => ({ ...current, ...incoming }));
  const receiveSpec = (incoming: Partial<JobSpec>) => setSpec((current) => ({ ...current, ...incoming }));

  const identify = async () => {
    if (description.trim().length < 8) { toast.error('Briefly describe what you need priced first.'); return; }
    setLoading(true);
    try {
      const response = await fetch('/api/verticals/classify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ description }) });
      const body = await response.json() as { config?: VerticalConfig; confidence?: number; reason?: string; source?: string; error?: string };
      if (!response.ok || !body.config) throw new Error(body.error ?? 'Could not identify the service type.');
      setConfig(body.config);
      setClassification({ confidence: body.confidence ?? 0, reason: body.reason ?? '', source: body.source ?? 'unknown' });
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not identify the service type.'); }
    finally { setLoading(false); }
  };

  const confirmWedding = (completed: JobSpec) => {
    localStorage.setItem(jobSpecStorageKey, JSON.stringify(completed));
    toast.success('Wedding photography brief locked. Starting quote collection.');
    router.push('/calls');
  };
  const confirmGeneric = (job: GeneralJobSpec) => {
    localStorage.setItem(generalJobStorageKey, JSON.stringify(job));
    toast.success('Your brief is locked. Review the discovered vendor list next.');
    router.push('/discover');
  };

  return (
    <Layout>
      <div className="chat-wrapper">
        <div className="p-8 grow overflow-auto scrollbar-none space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-strong-950 font-inter">Build a quote-ready brief for any phone-priced service</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-sub-600">
              Describe what you need. The system proposes a vertical-specific intake structure, then you confirm one immutable brief before a vendor is contacted.
            </p>
          </div>
          {!config ? (
            <section className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-2xs">
              <h2 className="text-xl font-semibold text-strong-950 font-inter">What would you like us to price-shop?</h2>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Example: I need quotes to move a two-bedroom apartment from Rock Hill to Charlotte next month."
                className="mt-4 min-h-28 w-full rounded-xl border border-stroke-soft-200 bg-white-0 p-4 text-sm text-strong-950 placeholder:text-sub-600 outline-none transition-colors focus:border-blue-500"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                {examples.map((example) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => setDescription(example)}
                    className="rounded-xl border border-stroke-soft-200 bg-white-0 px-3 py-2 text-xs text-sub-600 transition-colors hover:border-strong-950 hover:text-strong-950 cursor-pointer"
                  >
                    {example}
                  </button>
                ))}
              </div>
              <button
                type="button"
                onClick={() => void identify()}
                disabled={loading}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-3 text-sm font-semibold text-white-0 transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {loading ? <LoaderCircle className="animate-spin size-4" /> : <Sparkles className="size-4" />}
                Identify service and build intake
              </button>
            </section>
          ) : (
            <>
              <section className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-5 shadow-2xs">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Proposed configuration</p>
                <h2 className="mt-1 text-xl font-semibold text-strong-950 font-inter">{config.displayName}</h2>
                <p className="mt-1.5 text-sm text-sub-600">
                  {config.summary} {classification && `(${Math.round(classification.confidence * 100)}% confidence — ${classification.reason})`}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setConfig(undefined);
                    setSpec(undefined);
                    setGenericValues(undefined);
                  }}
                  className="mt-3 text-xs font-semibold text-blue-600 transition-colors hover:underline cursor-pointer"
                >
                  Choose a different service
                </button>
              </section>
              {config.id === 'wedding_photography' ? (
                <>
                  <div className="grid gap-6 lg:grid-cols-5">
                    <div className="lg:col-span-3">
                      <VoiceIntake onSpecReceived={receiveSpec} />
                    </div>
                    <div className="lg:col-span-2">
                      <DocumentUpload onSpecReceived={receiveSpec} />
                    </div>
                  </div>
                  {spec && <JobSpecConfirm spec={spec} onConfirm={confirmWedding} />}
                </>
              ) : (
                <>
                  <GenericVoiceIntake config={config} onSpecReceived={receiveGenericValues} />
                  <GenericDocumentUpload config={config} onSpecReceived={receiveGenericValues} />
                  <GenericBriefForm config={config} initialValues={genericValues} onConfirm={confirmGeneric} />
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
