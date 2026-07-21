const steps = ['Move details', 'Gathering quotes', 'Negotiation', 'Your report'];

export function StepProgress({ current }: { current: number }) {
  return (
    <ol className="grid grid-cols-4 gap-2 border-b border-stroke-soft-200 pb-6">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const completed = stepNumber < current;
        const active = stepNumber === current;
        return (
          <li key={step} className="flex items-center gap-2">
            <span className={`grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold ${completed ? 'border-blue-500 bg-blue-500 text-white-0' : active ? 'border-strong-950 bg-strong-950 text-white-0' : 'border-stroke-soft-200 bg-weak-50 text-sub-600'}`}>
              {stepNumber}
            </span>
            <span className={`hidden text-[11px] font-semibold uppercase tracking-[0.08em] md:block ${active ? 'text-strong-950 font-bold' : completed ? 'text-strong-950 font-medium' : 'text-sub-600 font-medium'}`}>
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
