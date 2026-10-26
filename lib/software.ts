import rawData from '../data/software.json';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Software {
  name: string;
  slug: string;
  description: string;
  github_url: string;
  stars: number;
  language: string;
  last_updated: string;
  license: string;
  saas_alternative: string;
  category: string;
  has_docker: boolean;
  topics: string[];
}

interface SoftwareFile {
  generated_at: string;
  total: number;
  software: Software[];
}

// ── Core accessors ────────────────────────────────────────────────────────────

export function getAllSoftware(): Software[] {
  return (rawData as SoftwareFile).software;
}

export function getCategories(): { name: string; count: number }[] {
  const map = new Map<string, number>();
  for (const s of getAllSoftware()) {
    if (s.category) map.set(s.category, (map.get(s.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function getSaasAlternatives(): string[] {
  const set = new Set<string>();
  for (const s of getAllSoftware()) {
    if (s.saas_alternative) set.add(s.saas_alternative);
  }
  return Array.from(set).sort();
}

export function getPopularSoftware(limit = 24): Software[] {
  return [...getAllSoftware()]
    .sort((a, b) => b.stars - a.stars)
    .slice(0, limit);
}

export function getSoftwareBySaas(saas: string): Software[] {
  return getAllSoftware()
    .filter(s => s.saas_alternative === saas)
    .sort((a, b) => b.stars - a.stars);
}

export function getSoftwareByCategory(category: string): Software[] {
  return getAllSoftware()
    .filter(s => s.category === category)
    .sort((a, b) => b.stars - a.stars);
}

// ── Slug helpers ──────────────────────────────────────────────────────────────

export function saasToSlug(saas: string): string {
  return (
    saas
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '') + '-alternatives'
  );
}

export function slugToSaas(slug: string): string | null {
  const base = slug.replace(/-alternatives$/, '');
  return (
    getSaasAlternatives().find(saas => {
      const s = saas
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      return s === base;
    }) ?? null
  );
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatStars(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return n.toString();
}

export function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', year: 'numeric' }).format(
      new Date(iso),
    );
  } catch {
    return iso;
  }
}

// ── SEO helpers ───────────────────────────────────────────────────────────────

export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'https://opensourcehub.io';
}
