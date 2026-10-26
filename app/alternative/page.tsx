import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Search, Star } from 'lucide-react';
import { getSaasAlternatives, getSoftwareBySaas, saasToSlug, formatStars } from '@/lib/software';

export const metadata: Metadata = {
  title: 'All Open-Source Alternatives — Browse by SaaS Tool',
  description:
    'Browse all SaaS tools we cover. Find free, self-hosted, open-source alternatives to every major software product.',
};

export default function AlternativeIndexPage() {
  const saasAlts = getSaasAlternatives();

  return (
    <div className="min-h-screen bg-slate-950">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        {/* Header */}
        <div className="max-w-2xl mb-14">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
            <Search className="w-3.5 h-3.5" />
            {saasAlts.length} SaaS tools covered
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white mb-4 leading-tight">
            Open-Source Alternatives,<br />
            <span className="text-emerald-400">Tool by Tool</span>
          </h1>
          <p className="text-slate-400 text-lg">
            Every page lists the best free, self-hosted replacements for a single SaaS product —
            with comparison tables, quickstart guides, and deploy instructions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {saasAlts.map(saas => {
            const tools  = getSoftwareBySaas(saas);
            const topPick = tools[0];
            const dockerCount = tools.filter(t => t.has_docker).length;

            return (
              <Link
                key={saas}
                href={`/alternative/${saasToSlug(saas)}`}
                className="group flex flex-col gap-4 bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/40 hover:bg-slate-800 rounded-xl p-5 transition-all"
              >
                {/* Title */}
                <div>
                  <h2 className="text-white font-bold text-base group-hover:text-emerald-400 transition-colors mb-0.5">
                    {saas} Alternatives
                  </h2>
                  <p className="text-slate-400 text-sm">
                    {tools.length} open-source tool{tools.length !== 1 ? 's' : ''}
                    {dockerCount > 0 && ` · ${dockerCount} Docker-ready`}
                  </p>
                </div>

                {/* Top pick */}
                {topPick && (
                  <div className="flex items-center gap-3 bg-slate-900/60 rounded-lg px-3 py-2.5">
                    <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Star className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate">{topPick.name}</p>
                      <p className="text-slate-500 text-xs">{formatStars(topPick.stars)} stars</p>
                    </div>
                  </div>
                )}

                {/* Arrow */}
                <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-400 transition-colors text-xs font-medium mt-auto">
                  View all alternatives
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
