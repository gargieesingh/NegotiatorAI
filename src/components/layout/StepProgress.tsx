const steps = ['Move details', 'Gathering quotes', 'Negotiation', 'Your report'];

export function StepProgress({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2 border-b border-negotiator-border pb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const completed = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span className={`grid h-5 w-5 place-items-center border text-[10px] font-bold ${completed ? 'border-negotiator-success bg-negotiator-success text-negotiator-bg' : active ? 'border-negotiator-accent bg-negotiator-accent text-white' : 'border-negotiator-border text-slate-500'}`}>
              {stepNumber}
            </span>
            <span className={`hidden text-[11px] font-semibold uppercase tracking-[0.08em] md:block ${active ? 'text-slate-100' : completed ? 'text-slate-400' : 'text-slate-600'}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
