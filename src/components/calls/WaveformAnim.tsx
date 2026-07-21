'use client';

import { cn } from '@/lib/utils';
import { Mic, Volume2 } from 'lucide-react';

export function WaveformAnim({ active }: { active: boolean }) {
  return (
    <div className="my-4 flex flex-col gap-2">
      {/* Waveform Equalizer Container */}
      <div className={cn(
        "relative flex h-14 items-center justify-center gap-[4px] rounded-2xl border px-4 py-2 overflow-hidden transition-all duration-300",
        active
          ? "border-blue-200 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-blue-50/80 shadow-[0_0_1.25rem_0_rgba(51,92,255,0.08)]"
          : "border-stroke-soft-200 bg-weak-50"
      )}>
        {/* Background ambient pulse for active state */}
        {active && (
          <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
        )}

        {Array.from({ length: 32 }).map((_, index) => {
          const baseHeight = 25 + Math.sin(index * 0.5) * 35;
          const delay = (index % 8) * 0.07;
          const duration = 0.35 + (index % 5) * 0.12;

          return (
            <span
              key={index}
              className={cn(
                'w-[3px] rounded-full transition-all duration-150 relative z-10',
                active
                  ? 'bg-gradient-to-t from-blue-600 via-blue-500 to-indigo-500 shadow-xs'
                  : 'h-2 bg-stroke-soft-200'
              )}
              style={
                active
                  ? {
                      height: `${baseHeight}%`,
                      animation: `audio-eq ${duration}s ease-in-out infinite alternate`,
                      animationDelay: `${delay}s`,
                    }
                  : undefined
              }
            />
          );
        })}

        {active && (
          <style jsx>{`
            @keyframes audio-eq {
              0% {
                height: 12%;
                opacity: 0.35;
                transform: scaleY(0.7);
              }
              50% {
                height: 95%;
                opacity: 1;
                transform: scaleY(1.1);
              }
              100% {
                height: 40%;
                opacity: 0.75;
                transform: scaleY(0.9);
              }
            }
          `}</style>
        )}
      </div>

      {/* Voice Status Pill */}
      {active && (
        <div className="flex items-center justify-between px-2 text-xs font-semibold text-blue-600">
          <div className="flex items-center gap-1.5">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-blue-600" />
            </span>
            <Mic className="size-3.5 text-blue-600 animate-pulse" />
            <span>Negotiator AI Speaking</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-sub-600">
            <Volume2 className="size-3 text-blue-500 animate-pulse" />
            <span>Live Audio Stream</span>
          </div>
        </div>
      )}
    </div>
  );
}
