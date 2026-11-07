/**
 * Affiliate / referral links: the ONE place to edit.
 *
 * Replace YOUR_REF in a provider's `url` with your real referral code (or paste the full
 * tracking link from your affiliate dashboard). Until a link is replaced, that provider is
 * hidden everywhere on the site and no "affiliate links" disclosure is shown.
 *
 * Check the price/credit wording against each program's current offer before going live.
 */

export type ProviderKey = 'digitalocean' | 'vultr' | 'linode';

export interface AffiliateProvider {
  key: ProviderKey;
  name: string;
  price: string;
  credit: string;
  shortCredit: string;
  url: string;
  gradient: string;
  badge: string;
}

export const AFFILIATE_PROVIDERS: Record<ProviderKey, AffiliateProvider> = {
  digitalocean: {
    key: 'digitalocean',
    name: 'DigitalOcean',
    price: '$5/mo',
    credit: '$200 free credit',
    shortCredit: '$200 free',
    url: 'https://www.digitalocean.com/?refcode=YOUR_REF&utm_campaign=Referral_Invite',
    gradient: 'from-blue-600 via-blue-500 to-indigo-600',
    badge: 'Most Popular',
  },
  vultr: {
    key: 'vultr',
    name: 'Vultr',
    price: '$5/mo',
    credit: '$100 free credit',
    shortCredit: '$100 free',
    url: 'https://www.vultr.com/?ref=YOUR_REF',
    gradient: 'from-indigo-600 via-violet-600 to-purple-700',
    badge: 'Best Value',
  },
  linode: {
    key: 'linode',
    name: 'Akamai / Linode',
    price: '$5/mo',
    credit: '$100 free credit',
    shortCredit: '$100 free',
    url: 'https://www.linode.com/?r=YOUR_REF',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    badge: 'Battle-tested',
  },
};

/** Plain (non-affiliate) provider links, shown without a sponsored label. */
export const PLAIN_LINKS = [
  { name: 'Hetzner', credit: 'Best EU pricing', shortCredit: 'EU pricing', url: 'https://www.hetzner.com/' },
];

export function isLive(url: string): boolean {
  return !url.includes('YOUR_REF');
}

export function liveProviders(): AffiliateProvider[] {
  return Object.values(AFFILIATE_PROVIDERS).filter(p => isLive(p.url));
}

export function hasLiveAffiliates(): boolean {
  return liveProviders().length > 0;
}

/** Primary "deploy" link used by the navbar and tool cards. */
export const DEPLOY_PROVIDER = AFFILIATE_PROVIDERS.digitalocean;
