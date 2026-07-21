import Link from 'next/link';

interface NavbarProps {
  step?: number;
  label?: string;
}

export function Navbar({ step, label }: NavbarProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-stroke-soft-200 bg-white-0/95 shadow-[0_0_1.25rem_0_rgba(0,0,0,0.03)] backdrop-blur">
      <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-6">
        <Link href="/" className="text-base font-bold tracking-wide">
          <span className="text-sub-600">THE </span>
          <span className="text-strong-950 font-bold">NEGOTIATOR</span>
        </Link>
        {step && label ? (
          <p className="font-mono text-xs text-sub-600">
            Step {step} of 4: <span className="text-strong-950 font-semibold">{label}</span>
          </p>
        ) : (
          <p className="hidden text-xs text-sub-600 sm:block">Your AI advocate for transparent moving quotes</p>
        )}
      </div>
    </header>
  );
}

