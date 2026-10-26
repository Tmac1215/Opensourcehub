import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Terminal, Star, ExternalLink,
  Zap, ArrowRight, Server, Shield, GitFork,
} from 'lucide-react';

import {
  getSaasAlternatives,
  getSoftwareBySaas,
  saasToSlug,
  slugToSaas,
  formatStars,
  getSiteUrl,
  type Software,
} from '@/lib/software';
import SoftwareCard from '@/components/SoftwareCard';
import AffiliateCTA from '@/components/AffiliateCTA';
import AdSlot from '@/components/AdSlot';

// ── Static params (build-time SSG) ───────────────────────────────────────────

export async function generateStaticParams() {
  return getSaasAlternatives().map(saas => ({ slug: saasToSlug(saas) }));
}

export const dynamicParams = false;

// ── Metadata ──────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const saas = slugToSaas(params.slug);
  if (!saas) return { title: 'Not Found' };

  const tools = getSoftwareBySaas(saas);
  const year  = new Date().getFullYear();

  return {
    title: `${tools.length} Best Open-Source Alternatives to ${saas} in ${year}`,
    description: `Discover the ${tools.length} best free, self-hosted alternatives to ${saas}. Full data ownership, deploy with Docker, no vendor lock-in.`,
    openGraph: {
      title: `Open-Source Alternatives to ${saas} (${year})`,
      description: `${tools.length} free, self-hosted alternatives to ${saas}. Self-host in minutes.`,
      type: 'article',
      url: `${getSiteUrl()}/alternative/${params.slug}`,
    },
    alternates: {
      canonical: `/alternative/${params.slug}`,
    },
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const FEATURE_ROWS = [
  { feature: 'Free to use (forever)',          os: true,  saas: false },
  { feature: 'Self-hosted / private data',     os: true,  saas: false },
  { feature: 'Open source (auditable code)',   os: true,  saas: false },
  { feature: 'No vendor lock-in',              os: true,  saas: false },
  { feature: 'Docker / 1-click deploy',        os: true,  saas: false },
  { feature: 'Unlimited users / events',       os: true,  saas: false },
  { feature: 'Custom domain & branding',       os: true,  saas: true  },
  { feature: 'Managed updates & backups',      os: false, saas: true  },
  { feature: 'Built-in CDN & scaling',         os: false, saas: true  },
  { feature: 'Enterprise SLA & support',       os: false, saas: true  },
];

function getQuickstartSteps(s: Software): { cmd: string; note: string }[] {
  if (s.has_docker) {
    return [
      { cmd: `git clone ${s.github_url}`, note: 'Clone the repository to your server' },
      { cmd: 'cp .env.example .env && nano .env', note: 'Configure environment variables' },
      { cmd: 'docker-compose up -d', note: 'Start all services in the background' },
      { cmd: 'open http://localhost:3000', note: 'Finish setup in the web UI' },
    ];
  }
  return [
    { cmd: `git clone ${s.github_url}`, note: 'Clone the repository' },
    { cmd: 'npm install && cp .env.example .env', note: 'Install dependencies and configure env' },
    { cmd: 'npm run build && npm start', note: 'Build and launch the application' },
    { cmd: 'Configure reverse proxy (nginx/Caddy)', note: 'Point your domain at the app' },
  ];
}

function buildJsonLd(saas: string, slug: string, tools: Software[]) {
  const siteUrl = getSiteUrl();
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ItemList',
        name: `Open-Source Alternatives to ${saas}`,
        description: `The ${tools.length} best free, self-hosted alternatives to ${saas}.`,
        url: `${siteUrl}/alternative/${slug}`,
        numberOfItems: tools.length,
        itemListElement: tools.slice(0, 10).map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: t.github_url,
          description: t.description || undefined,
        })),
      },
      ...tools.slice(0, 6).map(t => ({
        '@type': 'SoftwareApplication',
        name: t.name,
        url: t.github_url,
        description: t.description || undefined,
        applicationCategory: 'WebApplication',
        operatingSystem: 'Linux, macOS, Windows, Docker',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        license: t.license || 'Open Source',
      })),
    ],
  };
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AlternativePage({ params }: { params: { slug: string } }) {
  const saas = slugToSaas(params.slug);
  if (!saas) notFound();

  const tools   = getSoftwareBySaas(saas);
  if (tools.length === 0) notFound();

  const topPick  = tools[0];
  const steps    = getQuickstartSteps(topPick);
  const jsonLd   = buildJsonLd(saas, params.slug, tools);
  const allSaas  = getSaasAlternatives();
  const related  = allSaas.filter(s => s !== saas).slice(0, 10);
  const year     = new Date().getFullYear();

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-950">

        {/* ── Top Ad ──────────────────────────────────────────────────────── */}
        <div className="bg-slate-900/60 py-3 border-b border-slate-800/60 flex justify-center">
          <AdSlot slot="alt-top" format="leaderboard" />
        </div>

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <nav aria-label="breadcrumb" className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-300 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/alternative" className="hover:text-slate-300 transition-colors">Alternatives</Link>
            <span>/</span>
            <span className="text-slate-300 truncate">{saas}</span>
          </nav>
        </div>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
              <Terminal className="w-3.5 h-3.5" />
              {tools.length} open-source alternatives found
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
              Best Open-Source Alternatives<br />
              to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {saas}
              </span>{' '}
              in {year}
            </h1>

            <p className="text-lg text-slate-400 mb-8 max-w-2xl leading-relaxed">
              Stop paying for {saas}. These free, open-source tools give you full data ownership,
              no vendor lock-in, and deploy for as little as <strong className="text-white">$5/month</strong> on your own VPS.
            </p>

            {/* Top pick highlight card */}
            <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-emerald-400 fill-current" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-500 mb-0.5">Top pick</div>
                <div className="text-white font-semibold truncate">{topPick.name}</div>
                <div className="text-xs text-slate-400">
                  {formatStars(topPick.stars)} ⭐ · {topPick.license || 'Open source'}
                </div>
              </div>
              <a
                href={topPick.github_url}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 font-medium"
              >
                View <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        {/* ── Main + Sidebar layout ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">

            {/* ── MAIN CONTENT ──────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-14">

              {/* 1. Comparison table */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-6">
                  Open Source vs {saas}: Full Comparison
                </h2>
                <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-800/80 border-b border-slate-700/50">
                        <th className="text-left px-5 py-4 text-slate-300 font-semibold w-1/2">Feature</th>
                        <th className="text-center px-5 py-4 font-semibold">
                          <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                            <GitFork className="w-4 h-4" /> Open Source
                          </span>
                        </th>
                        <th className="text-center px-5 py-4 font-semibold">
                          <span className="text-blue-400">{saas}</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/30">
                      {FEATURE_ROWS.map((row, i) => (
                        <tr
                          key={row.feature}
                          className={i % 2 === 0 ? 'bg-slate-900/30' : 'bg-slate-800/20'}
                        >
                          <td className="px-5 py-3.5 text-slate-300">{row.feature}</td>
                          <td className="px-5 py-3.5 text-center">
                            {row.os
                              ? <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                              : <XCircle className="w-5 h-5 text-slate-600 mx-auto" />}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {row.saas
                              ? <CheckCircle2 className="w-5 h-5 text-blue-400 mx-auto" />
                              : <XCircle className="w-5 h-5 text-slate-600 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 2. Quickstart guide */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Deploy {topPick.name} in Minutes
                </h2>
                <p className="text-slate-400 mb-6">
                  {topPick.has_docker
                    ? 'This tool ships with Docker support — the fastest way to get a production instance running.'
                    : 'Follow these steps to get your self-hosted instance up and running.'}
                </p>

                <ol className="space-y-3" aria-label="Quickstart steps">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <code className="block text-slate-200 text-sm font-mono bg-slate-900/60 rounded-lg px-3 py-2 mb-1.5 overflow-x-auto">
                          {step.cmd}
                        </code>
                        <p className="text-slate-500 text-xs">{step.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Inline CTA */}
                <div className="mt-6">
                  <AffiliateCTA softwareName={topPick.name} provider="digitalocean" compact />
                </div>
              </section>

              {/* 3. In-content Ad */}
              <AdSlot slot="alt-in-content" format="banner" />

              {/* 4. Full affiliate CTA */}
              <section>
                <AffiliateCTA softwareName={topPick.name} provider="vultr" />
              </section>

              {/* 5. Software grid */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-2">
                  All Open-Source Alternatives to {saas}
                </h2>
                <p className="text-slate-400 mb-6">
                  Sorted by GitHub stars — the most popular community-backed options first.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tools.map((s, i) => (
                    <SoftwareCard key={s.slug + i} software={s} highlighted={i === 0} />
                  ))}
                </div>
              </section>

            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────── */}
            <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">

              {/* Sidebar Ad */}
              <AdSlot slot="alt-sidebar-top" format="rectangle" />

              {/* Quick Deploy widget */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-white font-bold mb-1 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Quick Deploy
                </h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  Get a VPS and run any of these tools in under 10 minutes.
                </p>

                {(
                  [
                    { name: 'DigitalOcean', credit: '$200 free',  url: 'https://www.digitalocean.com/?refcode=YOUR_REF' },
                    { name: 'Vultr',        credit: '$100 free',  url: 'https://www.vultr.com/?ref=YOUR_REF' },
                    { name: 'Linode',       credit: '$100 free',  url: 'https://www.linode.com/?r=YOUR_REF' },
                    { name: 'Hetzner',      credit: 'EU pricing', url: 'https://www.hetzner.com/' },
                  ] as const
                ).map(p => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0 group"
                  >
                    <span className="text-slate-300 text-sm group-hover:text-emerald-400 transition-colors">{p.name}</span>
                    <span className="text-xs text-emerald-500 group-hover:text-emerald-400 transition-colors flex items-center gap-1">
                      {p.credit} <ArrowRight className="w-3 h-3" />
                    </span>
                  </a>
                ))}
              </div>

              {/* Stats widget */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-white font-bold mb-4 text-sm">About These Tools</h3>
                <dl className="space-y-3">
                  {[
                    { label: 'Total alternatives',  value: tools.length.toString() },
                    { label: 'Docker-ready',         value: tools.filter(t => t.has_docker).length.toString() },
                    { label: 'Top stars',            value: formatStars(topPick.stars) + ' ⭐' },
                    { label: 'Most popular',         value: topPick.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between text-sm">
                      <dt className="text-slate-400">{label}</dt>
                      <dd className="text-white font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Related alternatives */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-slate-400" />
                  More Alternatives
                </h3>
                <ul className="space-y-2">
                  {related.map(s => (
                    <li key={s}>
                      <Link
                        href={`/alternative/${saasToSlug(s)}`}
                        className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                      >
                        <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {s} alternatives
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/alternative"
                  className="block mt-4 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                >
                  View all alternatives →
                </Link>
              </div>

              {/* Security note */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Why Self-Host?</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Your data stays on your servers. No third-party access, no usage-based pricing,
                      no sudden price hikes. You're in control.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom sidebar ad */}
              <AdSlot slot="alt-sidebar-bottom" format="rectangle" />
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
