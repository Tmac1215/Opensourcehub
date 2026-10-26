import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, TrendingUp, Shield, LayoutGrid, ArrowRight } from 'lucide-react';

import {
  getAllSoftware,
  getCategories,
  getSaasAlternatives,
  saasToSlug,
} from '@/lib/software';
import HomeClient from '@/components/HomeClient';
import AdSlot from '@/components/AdSlot';
import AffiliateCTA from '@/components/AffiliateCTA';
import SoftwareCard from '@/components/SoftwareCard';

// ── Metadata ──────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title: 'OpenSourceHub — Free Open-Source Alternatives to Every SaaS Tool',
  description:
    'Browse 500+ self-hosted, open-source alternatives to Google Analytics, Slack, Notion, Shopify and more. Free forever. Deploy with Docker in minutes.',
  openGraph: {
    title: 'OpenSourceHub — Free Open-Source Alternatives to Every SaaS Tool',
    description:
      'Discover 500+ free, self-hosted alternatives to popular SaaS products. Own your data.',
    type: 'website',
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const software   = getAllSoftware();
  const categories = getCategories();
  const saasAlts   = getSaasAlternatives();
  const topSoftware = [...software].sort((a, b) => b.stars - a.stars).slice(0, 6);

  const stats = [
    { label: 'Open Source Tools', value: `${software.length}+`,     icon: Terminal   },
    { label: 'SaaS Replaced',     value: `${saasAlts.length}+`,     icon: TrendingUp },
    { label: 'Categories',        value: `${categories.length}`,     icon: LayoutGrid },
    { label: 'License Types',     value: '20+',                      icon: Shield     },
  ];

  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── Top Leaderboard Ad ─────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 py-3 border-b border-slate-800/60 flex justify-center">
        <AdSlot slot="top-leaderboard" format="leaderboard" />
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/25 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {software.length} tools indexed · Updated from GitHub
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-5 tracking-tight leading-[1.1]">
            Open-Source Alternatives
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
              to Every SaaS Tool
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop overpaying for SaaS subscriptions. Find free, self-hosted replacements for
            Google Analytics, Slack, Notion, Shopify and 50+ more — deploy with Docker in minutes.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#browse"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              <LayoutGrid className="w-4 h-4" />
              Browse All Tools
            </a>
            <Link
              href="/alternative"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              By SaaS Alternative
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 text-center"
            >
              <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl font-extrabold text-white tabular-nums">{value}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SaaS quick-links ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
          Browse by alternative
        </h2>
        <div className="flex flex-wrap gap-2">
          {saasAlts.map(saas => (
            <Link
              key={saas}
              href={`/alternative/${saasToSlug(saas)}`}
              className="text-sm px-4 py-2 rounded-full bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-400 transition-all"
            >
              {saas}
            </Link>
          ))}
        </div>
      </section>

      {/* ── Trending / Top picks ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            Trending This Month
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSoftware.map(s => (
            <SoftwareCard key={s.slug} software={s} highlighted />
          ))}
        </div>
      </section>

      {/* ── Mid-page CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <AffiliateCTA provider="digitalocean" />
      </section>

      {/* ── Full directory ─────────────────────────────────────────────────── */}
      <section id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <h2 className="text-2xl font-bold text-white mb-8">
          All Open-Source Tools
        </h2>
        <HomeClient software={software} categories={categories} />
      </section>

      {/* ── Bottom Banner Ad ───────────────────────────────────────────────── */}
      <div className="bg-slate-900/60 py-4 border-t border-slate-800/60 flex justify-center">
        <AdSlot slot="bottom-banner" format="banner" />
      </div>
    </div>
  );
}
