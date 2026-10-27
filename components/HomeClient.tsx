'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, SlidersHorizontal, Flame, Star, TrendingUp, Sprout } from 'lucide-react';
import type { Software } from '@/lib/software';
import SoftwareCard from './SoftwareCard';

interface CategoryMeta { name: string; count: number }

interface Props {
  software: Software[];
  categories: CategoryMeta[];
}

const PAGE_SIZE = 24;

const STAR_TIERS = [
  { label: 'All',    min: 0,     icon: SlidersHorizontal, color: 'text-slate-400' },
  { label: '10k+',  min: 10000, icon: Flame,              color: 'text-orange-400' },
  { label: '1k+',   min: 1000,  icon: Star,               color: 'text-amber-400'  },
  { label: '500+',  min: 500,   icon: TrendingUp,         color: 'text-emerald-400' },
  { label: '100+',  min: 100,   icon: Sprout,             color: 'text-blue-400'   },
];

export default function HomeClient({ software, categories }: Props) {
  const [query,          setQuery]    = useState('');
  const [activeCategory, setCategory] = useState<string | null>(null);
  const [minStars,       setMinStars] = useState(1000); // default: 1k+ stars
  const [page,           setPage]     = useState(1);

  const filtered = useMemo(() => {
    let list = software;

    // Star filter
    if (minStars > 0) list = list.filter(s => s.stars >= minStars);

    // Category filter
    if (activeCategory) list = list.filter(s => s.category === activeCategory);

    // Text search
    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.saas_alternative.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q),
      );
    }

    return list;
  }, [software, query, activeCategory, minStars]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = displayed.length < filtered.length;

  const handleCategory = useCallback((cat: string) => {
    setCategory(prev => prev === cat ? null : cat);
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const handleStarTier = useCallback((min: number) => {
    setMinStars(min);
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setCategory(null);
    setMinStars(1000);
    setPage(1);
  }, []);

  const isFiltered = Boolean(query || activeCategory || minStars !== 1000);

  // Count per category within current star filter
  const categoryCounts = useMemo(() => {
    const base = minStars > 0 ? software.filter(s => s.stars >= minStars) : software;
    const map = new Map<string, number>();
    for (const s of base) map.set(s.category, (map.get(s.category) ?? 0) + 1);
    return map;
  }, [software, minStars]);

  return (
    <div>
      {/* ── Search ────────────────────────────────────────────────────────── */}
      <div className="relative max-w-2xl mx-auto mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={handleSearch}
          placeholder="Search by name, category, or SaaS alternative…"
          className="w-full pl-12 pr-10 py-4 bg-slate-800 border border-slate-700 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl text-white placeholder-slate-500 text-base outline-none transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setPage(1); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Star tier filter ──────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-5 justify-center">
        {STAR_TIERS.map(({ label, min, icon: Icon, color }) => {
          const count = min === 0
            ? software.length
            : software.filter(s => s.stars >= min).length;
          const active = minStars === min;
          return (
            <button key={label} onClick={() => handleStarTier(min)}
              className={[
                'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all',
                active
                  ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700',
              ].join(' ')}>
              <Icon className={`w-3.5 h-3.5 ${active ? 'text-white' : color}`} />
              {label} stars
              <span className={`text-xs ${active ? 'text-emerald-100' : 'text-slate-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Category chips ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories
          .filter(c => (categoryCounts.get(c.name) ?? 0) > 0)
          .map(({ name }) => {
            const count = categoryCounts.get(name) ?? 0;
            return (
              <button key={name} onClick={() => handleCategory(name)}
                className={[
                  'px-3 py-1.5 rounded-full text-xs font-medium transition-all',
                  activeCategory === name
                    ? 'bg-blue-500 text-white'
                    : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700 border border-slate-700/80',
                ].join(' ')}>
                {name}
                <span className={`ml-1 ${activeCategory === name ? 'text-blue-100' : 'text-slate-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
      </div>

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400 text-sm">
          Showing{' '}
          <span className="text-white font-semibold">{displayed.length.toLocaleString()}</span>{' '}
          of{' '}
          <span className="text-white font-semibold">{filtered.length.toLocaleString()}</span>{' '}
          tools
        </p>
        {isFiltered && (
          <button onClick={clearAll}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> Reset filters
          </button>
        )}
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <Search className="w-12 h-12 mx-auto mb-4 text-slate-700" />
          <p className="text-lg font-medium text-slate-300">No results found</p>
          <p className="text-slate-500 text-sm mt-2 mb-6">Try different keywords or adjust the star filter.</p>
          <button onClick={clearAll}
            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 text-sm font-medium transition-colors">
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((s, i) => (
            <SoftwareCard key={s.slug + i} software={s} />
          ))}
        </div>
      )}

      {/* ── Load more ────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="text-center mt-12">
          <button onClick={() => setPage(p => p + 1)}
            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white rounded-xl transition-colors text-sm font-medium">
            Load more — {(filtered.length - displayed.length).toLocaleString()} remaining
          </button>
        </div>
      )}
    </div>
  );
}
