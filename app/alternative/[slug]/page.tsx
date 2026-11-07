import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  CheckCircle2, XCircle, Terminal, Star, ExternalLink,
  Zap, ArrowRight, Server, Shield, GitFork, ChevronDown,
} from 'lucide-react';

import {
  getSaasAlternatives,
  getSaasAlternativesByPopularity,
  getSoftwareBySaas,
  saasToSlug,
  slugToSaas,
  formatStars,
  formatDate,
  displayLicense,
  getFaqs,
  getGeneratedAt,
  getSiteUrl,
  type Faq,
  type Software,
} from '@/lib/software';
import { liveProviders, PLAIN_LINKS } from '@/lib/affiliates';
import SoftwareCard from '@/components/SoftwareCard';
import AffiliateCTA, { isProviderLive } from '@/components/AffiliateCTA';
import AdSlot, { ADS_ENABLED } from '@/components/AdSlot';

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
  const thin  = tools.length < 2; // single-tool pages stay out of search results

  return {
    title: `Best Open-Source ${saas} Alternatives (${year})`,
    description: `${tools.length} free, self-hosted alternative${tools.length === 1 ? '' : 's'} to ${saas}, ranked by GitHub stars. Compare licenses, languages and Docker support.`,
    openGraph: {
      title: `Open-Source Alternatives to ${saas} (${year})`,
      description: `${tools.length} free, self-hosted alternative${tools.length === 1 ? '' : 's'} to ${saas}.`,
      type: 'article',
      url: `/alternative/${params.slug}`,
      siteName: 'OpenSourceHub',
      locale: 'en_US',
    },
    alternates: {
      canonical: `/alternative/${params.slug}`,
    },
    robots: thin ? { index: false, follow: true } : undefined,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// General comparison of self-hosting vs. the commercial service. Individual projects vary.
const FEATURE_ROWS = [
  { feature: 'Free to self-host',                    os: true,  saas: false },
  { feature: 'You control where your data lives',    os: true,  saas: false },
  { feature: 'Source code available',                os: true,  saas: false },
  { feature: 'No vendor lock-in',                    os: true,  saas: false },
  { feature: 'No per-seat fees when self-hosted',    os: true,  saas: false },
  { feature: 'Custom domain & branding',             os: true,  saas: true  },
  { feature: 'Managed updates & backups',            os: false, saas: true  },
  { feature: 'Built-in CDN & scaling',               os: false, saas: true  },
  { feature: 'Vendor SLA & support',                 os: false, saas: true  },
];

function getQuickstartSteps(s: Software): { cmd: string; note: string }[] {
  if (s.has_docker) {
    return [
      { cmd: `git clone ${s.github_url}`, note: 'Clone the repository to your server' },
      { cmd: 'cp .env.example .env', note: 'If the project provides an example config, copy it and edit the values' },
      { cmd: 'docker compose up -d', note: 'Start the services if the project ships a compose file' },
      { cmd: '# open the address and port listed in the README', note: 'Finish first-run setup in the web interface' },
    ];
  }
  return [
    { cmd: `git clone ${s.github_url}`, note: 'Clone the repository' },
    { cmd: '# follow the install section of the README', note: 'Requirements and commands differ for every project' },
    { cmd: '# configure a reverse proxy such as Caddy or nginx', note: 'Point your domain at the running app' },
  ];
}

function topCounts(values: string[], limit: number): { value: string; n: number }[] {
  const map = new Map<string, number>();
  for (const v of values) if (v) map.set(v, (map.get(v) ?? 0) + 1);
  return Array.from(map.entries())
    .map(([value, n]) => ({ value, n }))
    .sort((a, b) => b.n - a.n || a.value.localeCompare(b.value))
    .slice(0, limit);
}

/** Plain-language summary generated from the data, so every page has unique, factual content. */
function buildSummary(saas: string, tools: Software[]): string {
  const n = tools.length;
  const top = tools[0];
  const parts: string[] = [];

  parts.push(
    `We track ${n} open-source alternative${n === 1 ? '' : 's'} to ${saas}. ` +
    `${top.name} is the most popular with ${formatStars(top.stars)} GitHub stars` +
    `${top.language ? ` and is written in ${top.language}` : ''}.`,
  );

  if (n > 1) {
    const langs = topCounts(tools.map(t => t.language), 2);
    if (langs.length > 0) {
      parts.push(`The most common language is ${langs.map(l => `${l.value} (${l.n})`).join(' followed by ')}.`);
    }
  }

  const licenses = topCounts(tools.map(t => displayLicense(t.license)), 2);
  if (licenses.length > 0) {
    parts.push(`Licenses include ${licenses.map(l => l.value).join(' and ')}; always check the license before you deploy.`);
  }

  const docker = tools.filter(t => t.has_docker).length;
  if (docker > 0) {
    parts.push(`${docker} of ${n} show Docker support in their repository.`);
  }

  const newest = tools.map(t => t.last_updated).filter(Boolean).sort().slice(-1)[0];
  if (newest) {
    parts.push(`The most recent update among them was ${formatDate(newest)}.`);
  }

  return parts.join(' ');
}

/** Replace {placeholders} in FAQ text with live values so answers stay accurate after data refreshes. */
function fillFaq(text: string, vars: Record<string, string>): string {
  return text.replace(/\{(\w+)\}/g, (match, key) => vars[key] ?? match);
}

function joinNames(names: string[]): string {
  if (names.length <= 1) return names.join('');
  return `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

function buildJsonLd(saas: string, slug: string, tools: Software[], faqs: Faq[]) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/alternative/${slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${siteUrl}/` },
          { '@type': 'ListItem', position: 2, name: 'Alternatives', item: `${siteUrl}/alternative` },
          { '@type': 'ListItem', position: 3, name: saas, item: pageUrl },
        ],
      },
      ...(faqs.length > 0
        ? [{
            '@type': 'FAQPage',
            mainEntity: faqs.map(f => ({
              '@type': 'Question',
              name: f.question,
              acceptedAnswer: { '@type': 'Answer', text: f.answer },
            })),
          }]
        : []),
      {
        '@type': 'ItemList',
        name: `Open-Source Alternatives to ${saas}`,
        description: `${tools.length} free, self-hosted alternatives to ${saas}.`,
        url: pageUrl,
        numberOfItems: tools.length,
        itemListElement: tools.slice(0, 10).map((t, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: t.name,
          url: t.github_url,
          description: t.description || undefined,
        })),
      },
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
  const faqVars = {
    saas,
    count: String(tools.length),
    top: topPick.name,
    topStars: formatStars(topPick.stars),
    tools: joinNames(tools.slice(0, 5).map(t => t.name)),
  };
  const faqs: Faq[] = getFaqs(saas).map(f => ({
    question: fillFaq(f.question, faqVars),
    answer: fillFaq(f.answer, faqVars),
  }));
  const jsonLd   = buildJsonLd(saas, params.slug, tools, faqs);
  const related  = getSaasAlternativesByPopularity(2).filter(s => s !== saas).slice(0, 10);
  const year     = new Date().getFullYear();
  const summary  = buildSummary(saas, tools);
  const topLicense = displayLicense(topPick.license);
  const dockerCount = tools.filter(t => t.has_docker).length;

  // Quick Deploy links: affiliate providers appear only once a real referral link is set
  const deployLinks = [
    ...liveProviders().map(p => ({ name: p.name, credit: p.shortCredit, url: p.url, sponsored: true })),
    ...PLAIN_LINKS.map(p => ({ name: p.name, credit: p.shortCredit, url: p.url, sponsored: false })),
  ];

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-slate-950">

        {/* ── Top Ad (hidden unless ads are enabled) ───────────────────────── */}
        {ADS_ENABLED && (
          <div className="bg-slate-900/60 py-3 border-b border-slate-800/60 flex justify-center">
            <AdSlot slot="alt-top" format="leaderboard" />
          </div>
        )}

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-slate-400">
            <Link href="/" className="hover:text-slate-200 transition-colors">Home</Link>
            <span aria-hidden="true">/</span>
            <Link href="/alternative" className="hover:text-slate-200 transition-colors">Alternatives</Link>
            <span aria-hidden="true">/</span>
            <span className="text-slate-300 truncate" aria-current="page">{saas}</span>
          </nav>
        </div>

        {/* ── Hero ────────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-emerald-400 text-sm font-medium mb-6">
              <Terminal className="w-3.5 h-3.5" aria-hidden="true" />
              {tools.length} open-source alternative{tools.length === 1 ? '' : 's'} found
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-5">
              Best Open-Source Alternatives<br />
              to{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {saas}
              </span>{' '}
              in {year}
            </h1>

            <p className="text-lg text-slate-400 mb-4 max-w-2xl leading-relaxed">
              Looking to move off {saas}? These free, open-source tools can be self-hosted, which means you
              keep control of your data and avoid per-seat pricing. Hosting a small instance typically
              starts around <strong className="text-white">$5/month</strong> on a VPS.
            </p>

            <p className="text-base text-slate-400 mb-8 max-w-2xl leading-relaxed">
              {summary}{' '}
              <span className="text-slate-400">Data refreshed {formatDate(getGeneratedAt())}.</span>
            </p>

            {/* Top pick highlight card */}
            <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 max-w-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 text-emerald-400 fill-current" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-slate-400 mb-0.5">Top pick</div>
                <div className="text-white font-semibold truncate">{topPick.name}</div>
                <div className="text-xs text-slate-400">
                  {formatStars(topPick.stars)} GitHub stars{topLicense ? ` · ${topLicense}` : ''}
                </div>
              </div>
              <a
                href={topPick.github_url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${topPick.name} on GitHub`}
                className="ml-auto flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition-colors shrink-0 font-medium"
              >
                View <ExternalLink className="w-3 h-3" aria-hidden="true" />
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
                <h2 className="text-2xl font-bold text-white mb-2">
                  Self-Hosted vs {saas}: At a Glance
                </h2>
                <p className="text-slate-400 text-sm mb-6">
                  A general comparison of self-hosting open-source software against the commercial service.
                  Individual projects differ, so check each project&apos;s license and documentation.
                </p>
                <div className="overflow-x-auto rounded-xl border border-slate-700/50">
                  <table className="w-full text-sm">
                    <caption className="sr-only">Comparison of self-hosted open-source tools and {saas}</caption>
                    <thead>
                      <tr className="bg-slate-800/80 border-b border-slate-700/50">
                        <th scope="col" className="text-left px-5 py-4 text-slate-300 font-semibold w-1/2">Feature</th>
                        <th scope="col" className="text-center px-5 py-4 font-semibold">
                          <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                            <GitFork className="w-4 h-4" aria-hidden="true" /> Open Source
                          </span>
                        </th>
                        <th scope="col" className="text-center px-5 py-4 font-semibold">
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
                          <th scope="row" className="px-5 py-3.5 text-slate-300 font-normal text-left">{row.feature}</th>
                          <td className="px-5 py-3.5 text-center">
                            {row.os
                              ? <CheckCircle2 role="img" aria-label="Yes" className="w-5 h-5 text-emerald-400 mx-auto" />
                              : <XCircle role="img" aria-label="No" className="w-5 h-5 text-slate-500 mx-auto" />}
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            {row.saas
                              ? <CheckCircle2 role="img" aria-label="Yes" className="w-5 h-5 text-blue-400 mx-auto" />
                              : <XCircle role="img" aria-label="No" className="w-5 h-5 text-slate-500 mx-auto" />}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 2. Typical setup */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Self-Hosting {topPick.name}: Typical Steps
                </h2>
                <p className="text-slate-400 mb-6">
                  These are the general steps for self-hosting a project like this. Exact commands, ports and
                  settings differ for every project, so follow the{' '}
                  <a
                    href={`${topPick.github_url}#readme`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                  >
                    official README
                  </a>{' '}
                  for {topPick.name}.
                  {dockerCount === 0 && ' We did not detect a Docker setup for the tools on this page.'}
                </p>

                <ol className="space-y-3" aria-label="Typical setup steps">
                  {steps.map((step, i) => (
                    <li key={i} className="flex gap-4 bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400 font-bold text-sm">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <code className="block text-slate-200 text-sm font-mono bg-slate-900/60 rounded-lg px-3 py-2 mb-1.5 overflow-x-auto">
                          {step.cmd}
                        </code>
                        <p className="text-slate-400 text-xs">{step.note}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                {/* Inline CTA (only with a real referral link) */}
                {isProviderLive('digitalocean') && (
                  <div className="mt-6">
                    <AffiliateCTA softwareName={topPick.name} provider="digitalocean" compact />
                  </div>
                )}
              </section>

              {/* 3. In-content Ad (hidden unless ads are enabled) */}
              {ADS_ENABLED && <AdSlot slot="alt-in-content" format="banner" />}

              {/* 4. Full affiliate CTA (only with a real referral link) */}
              {isProviderLive('vultr') && (
                <section>
                  <AffiliateCTA softwareName={topPick.name} provider="vultr" />
                </section>
              )}

              {/* 5. Software grid */}
              <section>
                <h2 className="text-2xl font-bold text-white mb-2">
                  All Open-Source Alternatives to {saas}
                </h2>
                <p className="text-slate-400 mb-6">
                  Sorted by GitHub stars, with the most popular community-backed options first.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {tools.map((s, i) => (
                    <SoftwareCard key={s.slug + i} software={s} highlighted={i === 0} />
                  ))}
                </div>
              </section>

              {/* 6. FAQ (from data/faqs.json) */}
              {faqs.length > 0 && (
                <section aria-labelledby="faq-heading">
                  <h2 id="faq-heading" className="text-2xl font-bold text-white mb-6">
                    {saas} Alternatives: Frequently Asked Questions
                  </h2>
                  <div className="space-y-3">
                    {faqs.map(f => (
                      <details
                        key={f.question}
                        className="group rounded-xl border border-slate-700/50 bg-slate-800/40 p-5"
                      >
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-white [&::-webkit-details-marker]:hidden">
                          <span>{f.question}</span>
                          <ChevronDown
                            className="h-4 w-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
                            aria-hidden="true"
                          />
                        </summary>
                        <p className="mt-3 leading-relaxed text-slate-300">{f.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

            </div>

            {/* ── SIDEBAR ───────────────────────────────────────────────── */}
            <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">

              {/* Sidebar Ad (hidden unless ads are enabled) */}
              {ADS_ENABLED && <AdSlot slot="alt-sidebar-top" format="rectangle" />}

              {/* Quick Deploy widget */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <h3 className="text-white font-bold mb-1 flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  Where to Host
                </h3>
                <p className="text-slate-400 text-xs mb-4 leading-relaxed">
                  A small VPS is enough to run most of these tools.
                </p>

                {deployLinks.map(p => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel={p.sponsored ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
                    className="flex items-center justify-between py-2.5 border-b border-slate-700/40 last:border-0 group"
                  >
                    <span className="text-slate-300 text-sm group-hover:text-emerald-400 transition-colors">{p.name}</span>
                    <span className="text-xs text-emerald-400 group-hover:text-emerald-300 transition-colors flex items-center gap-1">
                      {p.credit} <ArrowRight className="w-3 h-3" aria-hidden="true" />
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
                    ...(dockerCount > 0 ? [{ label: 'Docker detected', value: dockerCount.toString() }] : []),
                    { label: 'Top GitHub stars',    value: formatStars(topPick.stars) },
                    { label: 'Most popular',        value: topPick.name },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between gap-3 text-sm">
                      <dt className="text-slate-400">{label}</dt>
                      <dd className="text-white font-medium text-right truncate">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Related alternatives */}
              {related.length > 0 && (
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                  <h3 className="text-white font-bold mb-3 text-sm flex items-center gap-2">
                    <Server className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                    More Alternatives
                  </h3>
                  <ul className="space-y-2">
                    {related.map(s => (
                      <li key={s}>
                        <Link
                          href={`/alternative/${saasToSlug(s)}`}
                          className="text-sm text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1 group"
                        >
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
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
              )}

              {/* Security note */}
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <Shield className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="text-white font-bold text-sm mb-1">Why Self-Host?</h3>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Your data stays on servers you control, and there is no usage-based pricing from a
                      vendor. The trade-off: you handle updates, backups and security yourself.
                    </p>
                  </div>
                </div>
              </div>

              {/* Bottom sidebar ad (hidden unless ads are enabled) */}
              {ADS_ENABLED && <AdSlot slot="alt-sidebar-bottom" format="rectangle" />}
            </aside>

          </div>
        </div>
      </div>
    </>
  );
}
