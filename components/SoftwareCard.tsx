import Link from 'next/link';
import { Star, ExternalLink, Shield, Server, Calendar, Code2 } from 'lucide-react';
import { type Software, formatStars, formatDate, saasToSlug } from '@/lib/software';

interface Props {
  software: Software;
  highlighted?: boolean;
}

// Language → color dot
const LANG_COLOR: Record<string, string> = {
  TypeScript: 'bg-blue-400',
  JavaScript: 'bg-yellow-400',
  Python:     'bg-blue-500',
  Go:         'bg-cyan-400',
  Rust:       'bg-orange-500',
  Ruby:       'bg-red-500',
  PHP:        'bg-purple-400',
  Java:       'bg-orange-400',
  'C#':       'bg-green-400',
  'C++':      'bg-pink-400',
  Kotlin:     'bg-violet-400',
  Dart:       'bg-sky-400',
  Elixir:     'bg-purple-500',
};

export default function SoftwareCard({ software: s, highlighted = false }: Props) {
  return (
    <article
      className={[
        'group relative flex flex-col gap-3.5 rounded-xl border p-5 transition-all duration-200',
        highlighted
          ? 'bg-slate-800 border-emerald-500/40 ring-1 ring-emerald-500/20 shadow-lg shadow-emerald-500/5'
          : 'bg-slate-800/50 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600',
      ].join(' ')}
    >
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-white font-semibold truncate group-hover:text-emerald-400 transition-colors leading-snug">
            {s.name}
          </h3>
          <span className="text-xs font-medium text-emerald-500/80">{s.category}</span>
        </div>
        {/* Stars */}
        <div className="flex items-center gap-1 text-amber-400 shrink-0 bg-amber-400/10 px-2 py-1 rounded-full">
          <Star className="w-3 h-3 fill-current" />
          <span className="text-xs font-bold tabular-nums">{formatStars(s.stars)}</span>
        </div>
      </div>

      {/* ── Description ────────────────────────────────── */}
      <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 flex-1">
        {s.description || 'No description provided.'}
      </p>

      {/* ── Tags ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1.5">
        {s.saas_alternative && (
          <Link
            href={`/alternative/${saasToSlug(s.saas_alternative)}`}
            className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors font-medium"
          >
            Alt to {s.saas_alternative}
          </Link>
        )}
        {s.language && (
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
            <span className={`w-2 h-2 rounded-full shrink-0 ${LANG_COLOR[s.language] ?? 'bg-slate-500'}`} />
            {s.language}
          </span>
        )}
        {s.license && s.license !== 'NOASSERTION' && (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-slate-700/60 text-slate-300">
            <Shield className="w-2.5 h-2.5" />
            {s.license}
          </span>
        )}
        {s.has_docker && (
          <span className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Server className="w-2.5 h-2.5" />
            Docker
          </span>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-700/50 gap-2">
        {/* Last updated */}
        {s.last_updated && (
          <span className="inline-flex items-center gap-1 text-xs text-slate-500">
            <Calendar className="w-3 h-3" />
            {formatDate(s.last_updated)}
          </span>
        )}

        {/* Actions */}
        <div className="flex gap-1.5 ml-auto">
          <a
            href={s.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors font-medium"
          >
            <Code2 className="w-3 h-3" />
            GitHub
          </a>
          {s.has_docker && (
            <a
              href="https://www.digitalocean.com/?refcode=YOUR_REF"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Deploy
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
