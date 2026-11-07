import type { MetadataRoute } from 'next'
import { getSaasAlternatives, getSoftwareBySaas, getGeneratedAt, saasToSlug } from '@/lib/software'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.saasalternatives.online'

// Static pages only change when the site is edited; data pages change when the tool data is refreshed.
const SITE_UPDATED = new Date('2026-11-07')

export default function sitemap(): MetadataRoute.Sitemap {
  const parsed = new Date(getGeneratedAt())
  const dataUpdated = Number.isNaN(parsed.getTime()) ? SITE_UPDATED : parsed

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: dataUpdated, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/alternative`, lastModified: dataUpdated, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: SITE_UPDATED, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/affiliate-disclosure`, lastModified: SITE_UPDATED, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/submit`, lastModified: SITE_UPDATED, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: SITE_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
  ]

  // Only list alternative pages that have at least 2 tools (one-tool pages are marked noindex).
  const alternativePages: MetadataRoute.Sitemap = getSaasAlternatives()
    .filter((saas) => getSoftwareBySaas(saas).length >= 2)
    .map((saas) => ({
      url: `${SITE_URL}/alternative/${saasToSlug(saas)}`,
      lastModified: dataUpdated,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticPages, ...alternativePages]
}
