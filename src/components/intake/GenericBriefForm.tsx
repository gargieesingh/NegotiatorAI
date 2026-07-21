'use client';

import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createSpecHash, generateId } from '@/lib/utils';
import type { GeneralJobSpec, VerticalConfig } from '@/lib/verticals';

interface GenericBriefFormProps {
  config: VerticalConfig;
  initialValues?: Record<string, string | number | boolean>;
  onConfirm: (job: GeneralJobSpec) => void;
}

export function GenericBriefForm({ config, initialValues, onConfirm }: GenericBriefFormProps) {
  const [values, setValues] = useState<Record<string, string | number | boolean>>(() => Object.fromEntries(config.intakeFields.map((field) => [field.key, field.type === 'boolean' ? false : ''])));
  useEffect(() => { if (initialValues) setValues((current) => ({ ...current, ...initialValues })); }, [initialValues]);
  const missing = config.intakeFields.filter((field) => field.required && (values[field.key] === '' || values[field.key] === undefined)).length;
  const update = (key: string, value: string | number | boolean) => setValues((current) => ({ ...current, [key]: value }));
  const submit = () => {
    if (missing) return;
    const unsigned = { vertical: config.id, config, data: values };
    onConfirm({ id: generateId(), vertical: config.id, config, data: values, confirmed_by_user: true, confirmed_at: new Date().toISOString(), spec_hash: createSpecHash(unsigned) });
  };

  return (
    <section className="mt-8 rounded-2xl border border-stroke-soft-200 bg-white-0 p-6 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-500">Configuration-driven intake</p>
          <h2 className="mt-2 text-2xl font-semibold text-strong-950">Confirm your {config.displayName.toLowerCase()} brief</h2>
          <p className="mt-2 max-w-2xl text-sm text-sub-600">These fields were selected for a comparable quote. We will reuse this exact confirmed brief for every vendor.</p>
        </div>
        <p className={`text-xs ${missing ? 'font-medium text-amber-600' : 'font-medium text-emerald-600'}`}>
          {missing ? `${missing} required fields need attention` : 'Brief ready for vendor discovery'}
        </p>
      </div>
      <div className="mt-6 grid gap-x-6 gap-y-5 md:grid-cols-2">
        {config.intakeFields.map((field) => (
          <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-sub-600">
              {field.label}
              {field.required ? ' *' : ''}
            </span>
            {field.type === 'boolean' ? (
              <span className="mt-2 flex items-center gap-2 text-sm text-strong-950">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.key])}
                  onChange={(event) => update(field.key, event.target.checked)}
                  className="accent-blue-500"
                />
                Yes
              </span>
            ) : field.type === 'select' ? (
              <select
                value={String(values[field.key] ?? '')}
                onChange={(event) => update(field.key, event.target.value)}
                className="mt-2 w-full rounded-xl border border-stroke-soft-200 bg-white-0 p-3 text-sm text-strong-950 outline-none transition-colors focus:border-blue-500"
              >
                <option value="">Select one</option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : field.type === 'textarea' ? (
              <textarea
                value={String(values[field.key] ?? '')}
                onChange={(event) => update(field.key, event.target.value)}
                className="mt-2 min-h-24 w-full rounded-xl border border-stroke-soft-200 bg-white-0 p-3 text-sm text-strong-950 outline-none transition-colors focus:border-blue-500"
              />
            ) : (
              <input
                type={field.type === 'number' ? 'number' : 'text'}
                value={String(values[field.key] ?? '')}
                onChange={(event) => update(field.key, field.type === 'number' ? Number(event.target.value) : event.target.value)}
                className="mt-2 w-full rounded-xl border border-stroke-soft-200 bg-white-0 p-3 text-sm text-strong-950 outline-none transition-colors focus:border-blue-500"
              />
            )}
            {field.help && <span className="mt-1 block text-xs text-sub-600">{field.help}</span>}
          </label>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stroke-soft-200 pt-5">
        <span className="inline-flex items-center gap-2 text-xs text-sub-600">
          <CheckCircle2 size={15} className="text-emerald-600" />
          You can edit this scope before discovery.
        </span>
        <button
          disabled={Boolean(missing)}
          onClick={submit}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white-0 transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Confirm and find vendors <ArrowRight size={16} />
        </button>
      </div>
    </section>
  );
}
