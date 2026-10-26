import Link from 'next/link';
import { Terminal, ExternalLink } from 'lucide-react';
import { getSaasAlternatives, saasToSlug } from '@/lib/software';

const CLOUD_PROVIDERS = [
  { name: 'DigitalOcean', credit: '$200 free credit', url: 'https://www.digitalocean.com/?refcode=YOUR_REF' },
  { name: 'Vultr',         credit: '$100 free credit', url: 'https://www.vultr.com/?ref=YOUR_REF' },
  { name: 'Linode / Akamai', credit: '$100 free credit', url: 'https://www.linode.com/?r=YOUR_REF' },
  { name: 'Hetzner',       credit: 'Best EU pricing',   url: 'https://www.hetzner.com/' },
];

export default function Footer() {
  const topAlts = getSaasAlternatives().slice(0, 8);

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
              {CLOUD_PROVIDERS.map(p => (
                <li key={p.name}>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer sponsored"
                    className="text-sm text-slate-400 hover:text-white transition-colors flex items-start gap-1 group"
                  >
                    <span className="flex-1">{p.name}</span>
                    <span className="text-emerald-500/70 text-xs shrink-0 group-hover:text-emerald-400 transition-colors mt-0.5">
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
                <a href="#" className="hover:text-white transition-colors">Submit a Tool</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Affiliate Disclosure</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} OpenSourceHub. Data sourced from GitHub public API.
          </p>
          <p className="text-xs text-slate-600">
            Some links are affiliate links — they help keep this site free.{' '}
            <a href="#" className="hover:text-slate-400 underline underline-offset-2">Disclosure</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
