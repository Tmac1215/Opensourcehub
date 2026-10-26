'use client';

import { useState, useMemo, useCallback } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { Software } from '@/lib/software';
import SoftwareCard from './SoftwareCard';

interface CategoryMeta {
  name: string;
  count: number;
}

interface Props {
  software: Software[];
  categories: CategoryMeta[];
}

const PAGE_SIZE = 24;

export default function HomeClient({ software, categories }: Props) {
  const [query, setQuery]           = useState('');
  const [activeCategory, setActive] = useState<string | null>(null);
  const [page, setPage]             = useState(1);

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = software;

    if (activeCategory) {
      list = list.filter(s => s.category === activeCategory);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter(
        s =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.saas_alternative.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q) ||
          s.language.toLowerCase().includes(q),
      );
    }

    return list;
  }, [software, query, activeCategory]);

  const displayed = filtered.slice(0, page * PAGE_SIZE);
  const hasMore   = displayed.length < filtered.length;

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCategory = useCallback((cat: string) => {
    setActive(prev => (prev === cat ? null : cat));
    setPage(1);
  }, []);

  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  }, []);

  const clearAll = useCallback(() => {
    setQuery('');
    setActive(null);
    setPage(1);
  }, []);

  const isFiltered = Boolean(query || activeCategory);

  return (
    <div>
      {/* ── Search bar ──────────────────────────────────────────────────────── */}
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
          <button
            onClick={() => { setQuery(''); setPage(1); }}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Category chips ──────────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 mb-8 justify-center">
        {categories.map(({ name, count }) => (
          <button
            key={name}
            onClick={() => handleCategory(name)}
            className={[
              'px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === name
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80 hover:border-slate-600',
            ].join(' ')}
          >
            {name}
            <span
              className={`ml-1.5 text-xs ${activeCategory === name ? 'text-emerald-100' : 'text-slate-500'}`}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Status bar ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-slate-400 text-sm flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Showing{' '}
          <span className="text-white font-semibold">{displayed.length.toLocaleString()}</span> of{' '}
          <span className="text-white font-semibold">{filtered.length.toLocaleString()}</span> tools
        </p>
        {isFiltered && (
          <button
            onClick={clearAll}
            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            Clear filters
          </button>
        )}
      </div>

      {/* ── Grid ────────────────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg font-medium text-slate-300">No results for "{query}"</p>
          <p className="text-sm mt-2 mb-6">Try a different keyword or browse by category.</p>
          <button
            onClick={clearAll}
            className="px-5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-colors text-sm font-medium"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayed.map((s, i) => (
            <SoftwareCard key={s.slug + i} software={s} />
          ))}
        </div>
      )}

      {/* ── Load more ───────────────────────────────────────────────────────── */}
      {hasMore && (
        <div className="text-center mt-12">
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white rounded-xl transition-colors text-sm font-medium"
          >
            Load more — {(filtered.length - displayed.length).toLocaleString()} remaining
          </button>
        </div>
      )}
    </div>
  );
}
