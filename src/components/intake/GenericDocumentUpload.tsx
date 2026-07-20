'use client';

import { FileText, LoaderCircle, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';
import type { VerticalConfig } from '@/lib/verticals';

interface GenericDocumentUploadProps { config: VerticalConfig; onSpecReceived: (values: Record<string, string | number | boolean>) => void; }

export function GenericDocumentUpload({ config, onSpecReceived }: GenericDocumentUploadProps) {
  const input = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && file.type !== 'image/png') { toast.error('Upload a PDF or PNG document.'); return; }
    setLoading(true);
    try {
      const form = new FormData(); form.append('file', file); form.append('config', JSON.stringify(config));
      const response = await fetch('/api/intake/normalize-generic-document', { method: 'POST', body: form });
      const body = await response.json() as { values?: Record<string, string | number | boolean>; error?: string; source?: string };
      if (!response.ok) throw new Error(body.error ?? 'Could not parse the document.');
      if (body.source !== 'cerebras') toast.message('Text was extracted. Add CEREBRAS_API_KEY to map document details into this custom vertical automatically.');
      if (body.values && Object.keys(body.values).length) { onSpecReceived(body.values); toast.success('Document details added to your confirmation brief.'); }
      else toast.message('No confirmed fields were found. Review and complete the brief manually.');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Could not parse the document.'); }
    finally { setLoading(false); if (input.current) input.current.value = ''; }
  };
  return <section className="mt-8 border border-negotiator-border bg-negotiator-surface p-6"><p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-negotiator-accent">Document intake</p><h2 className="mt-2 text-xl font-semibold">Upload a relevant PDF or PNG</h2><p className="mt-2 text-sm text-slate-400">Upload an existing quote, bill, scope, estimate, invitation, inventory, or other supporting document. It maps into the same confirmed brief.</p><input ref={input} type="file" accept="application/pdf,image/png" className="hidden" onChange={(event) => void upload(event.target.files?.[0])} /><button disabled={loading} onClick={() => input.current?.click()} className="mt-5 inline-flex items-center gap-2 border border-negotiator-accent px-4 py-3 text-sm font-semibold text-negotiator-accent disabled:opacity-60">{loading ? <LoaderCircle size={16} className="animate-spin" /> : <Upload size={16} />}{loading ? 'Extracting details…' : 'Upload PDF or PNG'}</button><p className="mt-4 inline-flex items-center gap-2 text-xs text-slate-500"><FileText size={14} />The source document is evidence; you still confirm every field.</p></section>;
}
