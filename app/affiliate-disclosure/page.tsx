import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Affiliate Disclosure',
  description:
    'How OpenSourceHub earns money through affiliate links and advertising, and how that does and does not affect what we list.',
  alternates: { canonical: '/affiliate-disclosure' },
};

export default function AffiliateDisclosurePage() {
  return (
    <LegalPage
      title="Affiliate Disclosure"
      updated="November 1, 2026"
      intro="OpenSourceHub is free to use. To cover the costs of running it, some links on this site may be affiliate links, and the site may show advertising."
    >
      <h2>What this means</h2>
      <p>
        If you click an affiliate link and then sign up for or buy a product, we may earn a commission or referral
        credit from that company. It does not cost you anything extra, and the price you pay is the same as if you had
        gone to the company directly.
      </p>
      <p>
        Affiliate links on this site are marked with the <code>rel=&quot;sponsored&quot;</code> attribute so that search
        engines can recognize them. We typically use them for hosting and infrastructure providers where you might
        run the open-source software we list.
      </p>

      <h2>What this does not affect</h2>
      <ul>
        <li>
          <strong>The open-source tools we list.</strong> Projects are included and ordered using public GitHub data
          (mainly stars), not payment. Open-source projects cannot buy a spot in our listings.
        </li>
        <li>
          <strong>The facts we show.</strong> We try to keep descriptions and details accurate regardless of any
          commercial relationship.
        </li>
      </ul>

      <h2>Advertising</h2>
      <p>
        We may display ads through Google AdSense or similar services. Advertisers do not control our content. For how
        ads use cookies and what you can do about it, see our <Link href="/privacy">privacy policy</Link>.
      </p>

      <h2>Your own research</h2>
      <p>
        Whether you use an affiliate link or not, please compare providers and read each project&apos;s documentation
        before you deploy anything. Self-hosting involves responsibilities such as security, backups and updates.
      </p>

      <h2>Questions</h2>
      <p>
        If you have questions about this disclosure, please reach us through our <Link href="/contact">contact form</Link>.
      </p>
    </LegalPage>
  );
}
