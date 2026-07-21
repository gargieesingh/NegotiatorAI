'use client';

import { FileUp, LoaderCircle } from 'lucide-react';
import { ChangeEvent, DragEvent, useState } from 'react';
import { toast } from 'sonner';
import type { DocumentParseResponse, JobSpec } from '@/lib/types';

interface DocumentUploadProps {
  onSpecReceived: (spec: Partial<JobSpec>) => void;
}

export function DocumentUpload({ onSpecReceived }: DocumentUploadProps) {
  const [fileName, setFileName] = useState<string>();
  const [loading, setLoading] = useState(false);

  const parseFile = async (file: File) => {
    setFileName(file.name);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch('/api/intake/parse-document', { method: 'POST', body: formData });
      const body = (await response.json()) as DocumentParseResponse | { error: string };
      if (!response.ok || 'error' in body) throw new Error('error' in body ? body.error : 'Document parsing failed');
      onSpecReceived(body.job_spec);
      toast.success(`Document parsed with ${body.confidence} confidence.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Document parsing failed');
      setFileName(undefined);
    } finally {
      setLoading(false);
    }
  };

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void parseFile(file);
  };
  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) void parseFile(file);
  };

  return (
    <section className="rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Or document intake</p>
      <h2 className="mt-2 text-2xl font-semibold text-strong-950">Upload an existing quote</h2>
      <p className="mt-2 text-sm leading-relaxed text-sub-600">We’ll extract the same wedding brief from an invitation or an existing photographer quote.</p>
      <label
        onDrop={onDrop}
        onDragOver={(event) => event.preventDefault()}
        className="mt-8 flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stroke-soft-200 bg-weak-50 px-5 text-center transition-all hover:border-blue-500 hover:bg-blue-50/30"
      >
        {loading ? <LoaderCircle className="animate-spin text-blue-500" size={28} /> : <FileUp className="text-blue-500" size={28} />}
        <span className="mt-4 text-sm font-semibold text-strong-950">{loading ? 'Parsing document...' : fileName ?? 'Drop a file here or choose one'}</span>
        <span className="mt-2 text-xs text-sub-600">Wedding invitation or photographer quote: PDF or PNG</span>
        <input className="sr-only" type="file" accept="application/pdf,image/png" onChange={onChange} disabled={loading} />
      </label>
    </section>
  );
}
