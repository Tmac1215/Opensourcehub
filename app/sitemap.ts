import type { MetadataRoute } from 'next'
import { getSaasAlternatives, getSoftwareBySaas, saasToSlug } from '@/lib/software'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.saasalternatives.online'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/alternative`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/affiliate-disclosure`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/submit`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.3 },
  ]

  // Only list alternative pages that have at least 2 tools; one-tool pages are too thin to be worth indexing.
  const alternativePages: MetadataRoute.Sitemap = getSaasAlternatives()
    .filter((saas) => getSoftwareBySaas(saas).length >= 2)
    .map((saas) => ({
      url: `${SITE_URL}/alternative/${saasToSlug(saas)}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

  return [...staticPages, ...alternativePages]
}
