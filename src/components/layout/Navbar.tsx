import Link from 'next/link';

interface NavbarProps {
  step?: number;
  label?: string;
}

export function Navbar({ step, label }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-negotiator-border bg-negotiator-bg/95 backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="text-base font-bold tracking-wide">
          <span className="text-slate-400">THE </span>
          <span className="text-negotiator-accent">NEGOTIATOR</span>
        </Link>
        {step && label ? (
          <p className="font-mono text-xs text-slate-400">
            Step {step} of 4: <span className="text-slate-100">{label}</span>
          </p>
        ) : (
          <p className="hidden text-xs text-slate-400 sm:block">Your AI advocate for transparent moving quotes</p>
        )}
      </div>
    </header>
  );
}
