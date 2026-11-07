import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[60vh] bg-slate-950 flex items-center justify-center px-4 py-24">
      <div className="max-w-md text-center">
        <p className="text-emerald-400 font-semibold text-sm mb-3">404</p>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Page not found</h1>
        <p className="text-slate-400 mb-8">
          The page you are looking for does not exist or has moved. Try browsing the alternatives instead.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3 transition-colors"
          >
            Go to homepage
          </Link>
          <Link
            href="/alternative"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3 transition-colors"
          >
            Browse alternatives <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
