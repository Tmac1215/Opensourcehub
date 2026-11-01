import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { CONTACT_URL } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'How OpenSourceHub handles visitor data, cookies, advertising (Google AdSense) and affiliate links.',
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="November 1, 2026"
      intro="This policy explains what information is collected when you visit OpenSourceHub (saasalternatives.online), how it is used, and the choices you have."
    >
      <h2>Information we collect</h2>
      <p>
        We do not require you to create an account, and the site does not have comment or sign-up forms, so we do not
        directly collect names, email addresses or similar personal details.
      </p>
      <p>
        Like most websites, our hosting provider (Vercel) automatically processes technical information needed to
        deliver pages, such as your IP address, browser type, device information, referring page and the pages you
        request. This is used to operate, secure and troubleshoot the site.
      </p>

      <h2>Cookies and advertising</h2>
      <p>
        We use Google AdSense to show advertising. Google and its partners use cookies and similar technologies to
        serve ads, including ads based on your prior visits to this and other websites, and to measure ad performance.
        Google&apos;s use of advertising cookies lets it and its partners serve ads to you based on your visit to our
        site and other sites on the internet.
      </p>
      <ul>
        <li>
          You can manage or opt out of personalized advertising in{' '}
          <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
        </li>
        <li>
          You can also opt out of many third-party ad vendors at{' '}
          <a href="https://www.aboutads.info" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
        </li>
        <li>
          To learn how Google uses data from sites that use its services, see{' '}
          <a
            href="https://policies.google.com/technologies/partner-sites"
            target="_blank"
            rel="noopener noreferrer"
          >
            How Google uses information from sites or apps that use our services
          </a>
          .
        </li>
      </ul>
      <p>
        Visitors in the European Economic Area, the United Kingdom and Switzerland may be shown a consent message
        before personalized ads are served. You can also control cookies through your browser settings, though some
        parts of the web may work differently if you block them.
      </p>

      <h2>Affiliate links</h2>
      <p>
        Some links on this site are affiliate links. If you click one, the partner&apos;s website may set its own cookies
        to track the referral. We do not control those cookies or the partner&apos;s privacy practices. See our{' '}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link> for more.
      </p>

      <h2>Third-party websites</h2>
      <p>
        This site links to GitHub, hosting providers and other external websites. We are not responsible for their
        content or privacy practices, and we encourage you to read their policies.
      </p>

      <h2>Data from GitHub</h2>
      <p>
        Information about open-source projects shown on this site comes from GitHub&apos;s public API. It describes
        public repositories and is not information about our visitors.
      </p>

      <h2>Children&apos;s privacy</h2>
      <p>
        This site is not directed at children under 13, and we do not knowingly collect personal information from
        children.
      </p>

      <h2>Your rights</h2>
      <p>
        Depending on where you live, you may have rights over your personal data, such as access, correction,
        deletion, or objection to certain processing. Because we do not maintain accounts or collect personal details
        ourselves, most data about your visit is held by our hosting provider and by Google, so requests about that data
        are best directed to them.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. The date at the top shows when it was last changed.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be raised through our{' '}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>. This is public, so
        please do not post private information there.
      </p>
    </LegalPage>
  );
}
