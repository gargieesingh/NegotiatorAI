import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white p-4">
      <h2 className="text-3xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-slate-400 mb-6">Could not find requested resource</p>
      <Link
        href="/"
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white font-medium transition-colors"
      >
        Return Home
      </Link>
    </div>
  );
}
