import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { CONTACT_URL } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'About',
  description:
    'About OpenSourceHub: a free directory of self-hosted, open-source alternatives to popular SaaS products, built from public GitHub data.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <LegalPage
      title="About OpenSourceHub"
      intro="OpenSourceHub is a free directory of self-hosted, open-source alternatives to popular SaaS products. If you want to own your data, cut your monthly bills, or just see what else is out there, this is a place to start."
    >
      <h2>What this site does</h2>
      <p>
        For each commercial software product we cover, we list open-source projects that can replace it, along with
        the information you need to compare them: what each project does, how popular it is, and whether it offers a
        Docker setup. You can browse by <Link href="/alternative">SaaS product</Link> or search and filter the full list
        on the <Link href="/">homepage</Link>.
      </p>

      <h2>Where the data comes from</h2>
      <p>
        Project details come from GitHub&apos;s public API, including descriptions, star counts, programming languages and
        update dates. Tools are ordered mainly by GitHub stars, which is a rough signal of popularity, not a quality
        rating. We have not tested every project, so please read each project&apos;s own documentation before relying on
        it.
      </p>

      <h2>A note on accuracy</h2>
      <p>
        Categories and &quot;alternative to&quot; labels are assigned automatically from project descriptions, so some
        will be wrong or incomplete. If you spot a mistake, or a tool that should be listed, please{' '}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">open an issue on GitHub</a> or use the{' '}
        <Link href="/submit">Submit a Tool</Link> page.
      </p>

      <h2>How the site is funded</h2>
      <p>
        The site is free to use. We may earn money from advertising and from affiliate links to hosting providers and
        other services. See our <Link href="/affiliate-disclosure">affiliate disclosure</Link> and{' '}
        <Link href="/privacy">privacy policy</Link> for details. Affiliate relationships do not decide which
        open-source tools are listed.
      </p>

      <h2>Contact</h2>
      <p>
        The best way to reach us is through our <Link href="/contact">contact form</Link>. For public corrections or
        suggestions, you can also use our <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>.
      </p>
    </LegalPage>
  );
}
