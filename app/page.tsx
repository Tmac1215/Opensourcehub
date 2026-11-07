import type { Metadata } from 'next';
import Link from 'next/link';
import { Terminal, TrendingUp, Shield, LayoutGrid, ArrowRight } from 'lucide-react';

import {
  getAllSoftware,
  getCategories,
  getSaasAlternatives,
  getLicenseCount,
  getSiteUrl,
  saasToSlug,
} from '@/lib/software';
import { AFFILIATE_PROVIDERS, isLive } from '@/lib/affiliates';
import HomeClient from '@/components/HomeClient';
import AdSlot, { ADS_ENABLED } from '@/components/AdSlot';
import AffiliateCTA from '@/components/AffiliateCTA';
import SoftwareCard from '@/components/SoftwareCard';

// ── Data (static, read at build time) ─────────────────────────────────────────

const software   = getAllSoftware();
const categories = getCategories();
const saasAlts   = getSaasAlternatives();

const HEADLINE_NAMES = ['Google Analytics', 'Notion', 'ChatGPT', 'Zapier'].filter(n => saasAlts.includes(n));
const MORE_COUNT     = saasAlts.length - HEADLINE_NAMES.length;

// ── Metadata ──────────────────────────────────────────────────────────────────

const TITLE = 'OpenSourceHub - Free Open-Source SaaS Alternatives';
const NAMES_TEXT =
  HEADLINE_NAMES.length > 1
    ? `${HEADLINE_NAMES.slice(0, -1).join(', ')} and ${HEADLINE_NAMES[HEADLINE_NAMES.length - 1]}`
    : HEADLINE_NAMES.join('');
const DESCRIPTION = `Browse ${software.length} self-hosted, open-source alternatives to ${saasAlts.length} popular SaaS products, including ${NAMES_TEXT}. Free to self-host.`;

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: '/' },
  openGraph: {
    title: TITLE,
    description: `Discover ${software.length} free, self-hosted alternatives to popular SaaS products. Own your data.`,
    type: 'website',
    url: '/',
  },
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HomePage() {
  const topSoftware = [...software].sort((a, b) => b.stars - a.stars).slice(0, 6);
  const siteUrl = getSiteUrl();

  const stats = [
    { label: 'Open Source Tools', value: `${software.length}`,          icon: Terminal   },
    { label: 'SaaS Replaced',     value: `${saasAlts.length}`,          icon: TrendingUp },
    { label: 'Categories',        value: `${categories.length}`,        icon: LayoutGrid },
    { label: 'License Types',     value: `${getLicenseCount()}`,        icon: Shield     },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: 'OpenSourceHub',
        url: `${siteUrl}/`,
        logo: `${siteUrl}/icon.svg`,
        description: `${software.length} self-hosted, open-source alternatives to popular SaaS products.`,
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: 'OpenSourceHub',
        description: DESCRIPTION,
        inLanguage: 'en',
        publisher: { '@id': `${siteUrl}/#organization` },
      },
    ],
  };

  const showMidCta = isLive(AFFILIATE_PROVIDERS.digitalocean.url);

  return (
    <div className="min-h-screen bg-slate-950">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ── Top Leaderboard Ad (hidden unless ads are enabled) ─────────────── */}
      {ADS_ENABLED && (
        <div className="bg-slate-900/60 py-3 border-b border-slate-800/60 flex justify-center">
          <AdSlot slot="top-leaderboard" format="leaderboard" />
        </div>
      )}

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
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
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
            Stop overpaying for SaaS subscriptions. Find free, self-hosted replacements for{' '}
            {HEADLINE_NAMES.join(', ')} and {MORE_COUNT} more.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#browse"
              className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-6 py-3.5 rounded-xl transition-colors shadow-lg shadow-emerald-500/25"
            >
              <LayoutGrid className="w-4 h-4" aria-hidden="true" />
              Browse All Tools
            </a>
            <Link
              href="/alternative"
              className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-colors"
            >
              By SaaS Alternative
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
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
              <Icon className="w-5 h-5 text-emerald-400 mx-auto mb-2" aria-hidden="true" />
              <div className="text-2xl font-extrabold text-white tabular-nums">{value}</div>
              <div className="text-xs text-slate-400 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SaaS quick-links ───────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
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
            <TrendingUp className="w-5 h-5 text-emerald-400" aria-hidden="true" />
            Most Popular on GitHub
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topSoftware.map(s => (
            <SoftwareCard key={s.slug} software={s} highlighted />
          ))}
        </div>
      </section>

      {/* ── Mid-page CTA (only with a real referral link) ──────────────────── */}
      {showMidCta && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <AffiliateCTA provider="digitalocean" />
        </section>
      )}

      {/* ── Full directory ─────────────────────────────────────────────────── */}
      <section id="browse" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 scroll-mt-20">
        <h2 className="text-2xl font-bold text-white mb-8">
          All Open-Source Tools
        </h2>
        <HomeClient software={software} categories={categories} />
      </section>

      {/* ── Bottom Banner Ad (hidden unless ads are enabled) ───────────────── */}
      {ADS_ENABLED && (
        <div className="bg-slate-900/60 py-4 border-t border-slate-800/60 flex justify-center">
          <AdSlot slot="bottom-banner" format="banner" />
        </div>
      )}
    </div>
  );
}
