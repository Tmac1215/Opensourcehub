import Link from 'next/link';
import { Terminal, ExternalLink } from 'lucide-react';
import { getSaasAlternativesByPopularity, saasToSlug } from '@/lib/software';
import { liveProviders, hasLiveAffiliates, PLAIN_LINKS } from '@/lib/affiliates';

export default function Footer() {
  // Affiliate providers only appear once a real referral link is set in lib/affiliates.ts
  const providers = [
    ...liveProviders().map(p => ({ name: p.name, credit: p.credit, url: p.url, sponsored: true })),
    ...PLAIN_LINKS.map(p => ({ name: p.name, credit: p.credit, url: p.url, sponsored: false })),
  ];
  const showAffiliateNote = hasLiveAffiliates();
  // Link to the best-covered alternatives (pages with at least 2 tools)
  const topAlts = getSaasAlternativesByPopularity(2).slice(0, 8);

  return (
    <footer className="border-t border-slate-800 bg-slate-950 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 font-bold text-white mb-4">
              <div className="w-7 h-7 rounded-md bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                <Terminal className="w-3.5 h-3.5 text-white" />
              </div>
              <span>OpenSourceHub</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              Find free, self-hosted alternatives to every SaaS tool. Own your data, cut your bills.
            </p>
            <a
              href="https://www.producthunt.com/products/opensourcehub-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-opensourcehub-2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-5"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="OpenSourceHub - Free Open-Source Alternatives to Every SaaS Tool | Product Hunt"
                width={250}
                height={54}
                loading="lazy"
                src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1301242&theme=light&t=1793599000921"
              />
            </a>
          </div>

          {/* Browse */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Browse Alternatives</h3>
            <ul className="space-y-2.5">
              {topAlts.map(saas => (
                <li key={saas}>
                  <Link
                    href={`/alternative/${saasToSlug(saas)}`}
                    className="text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                  >
                    {saas} alternatives
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/alternative" className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors font-medium">
                  View all →
                </Link>
              </li>
            </ul>
          </div>

          {/* Deploy */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Self-Host On</h3>
            <ul className="space-y-2.5">
              {providers.map(p => (
                <li key={p.name}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel={p.sponsored ? 'noopener noreferrer sponsored' : 'noopener noreferrer'}
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-start gap-1 group"
                  >
                    <span className="flex-1">{p.name}</span>
                    <span className="text-emerald-400 text-xs shrink-0 group-hover:text-emerald-300 transition-colors mt-0.5">
                      {p.credit}
                    </span>
                    <ExternalLink className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">About</h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link href="/alternative" className="hover:text-white transition-colors">All Alternatives</Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-white transition-colors">Submit a Tool</Link>
              </li>
              <li>
                <Link href="/affiliate-disclosure" className="hover:text-white transition-colors">Affiliate Disclosure</Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} OpenSourceHub. Data sourced from GitHub public API.
          </p>
          {showAffiliateNote && (
            <p className="text-xs text-slate-400">
              Some links are affiliate links — they help keep this site free.{' '}
              <Link href="/affiliate-disclosure" className="hover:text-white underline underline-offset-2">Disclosure</Link>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
