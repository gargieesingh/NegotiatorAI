'use client';

import { cn } from '@/lib/utils';

export function WaveformAnim({ active }: { active: boolean }) {
  return <div className="my-4 flex h-8 items-center gap-[2px]">{Array.from({ length: 24 }).map((_, index) => <span key={index} className={cn('w-1 transition-all', active ? 'animate-waveform bg-gradient-to-t from-blue-500 to-emerald-400' : 'h-2 bg-slate-700')} style={active ? { animationDelay: `${index * 0.05}s`, animationDuration: `${0.3 + (index % 5) * 0.08}s` } : undefined} />)}</div>;
}
