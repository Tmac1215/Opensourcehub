import type { Metadata } from 'next';
import Link from 'next/link';
import LegalPage, { CONTACT_URL } from '@/components/LegalPage';

export const metadata: Metadata = {
  title: 'Submit a Tool',
  description:
    'Suggest an open-source, self-hostable alternative to add to OpenSourceHub, or report an incorrect listing.',
  alternates: { canonical: '/submit' },
};

const ISSUE_BODY = [
  'Tool name:',
  'GitHub repository URL:',
  'SaaS product(s) it replaces:',
  'License:',
  'Can it be self-hosted? (Docker support, etc.):',
  'Anything else we should know:',
].join('\n');

const NEW_ISSUE_URL = `${CONTACT_URL}/new?title=${encodeURIComponent('Tool submission: ')}&body=${encodeURIComponent(ISSUE_BODY)}`;

export default function SubmitPage() {
  return (
    <LegalPage
      title="Submit a Tool"
      intro="Know an open-source project that deserves a spot, or see a listing that looks wrong? Let us know."
    >
      <h2>What we look for</h2>
      <ul>
        <li>The project is open source, with a public GitHub repository and a clear license.</li>
        <li>It can be self-hosted, ideally with Docker or similar setup instructions.</li>
        <li>It is a real alternative to a specific commercial SaaS product.</li>
        <li>It is actively maintained or still clearly useful.</li>
      </ul>

      <h2>How to submit</h2>
      <p>
        Submissions go through GitHub so everything stays public and easy to track.{' '}
        <a href={NEW_ISSUE_URL} target="_blank" rel="noopener noreferrer">
          Open a pre-filled submission on GitHub
        </a>{' '}
        and complete the fields. You will need a free GitHub account.
      </p>

      <h2>Report a problem</h2>
      <p>
        Wrong category, wrong &quot;alternative to&quot; label, broken link, or outdated details? Report it on our{' '}
        <a href={CONTACT_URL} target="_blank" rel="noopener noreferrer">GitHub issues page</a>. Categories are assigned
        automatically, so corrections help.
      </p>

      <h2>Please note</h2>
      <p>
        Submitting a tool does not guarantee it will be listed, and listings are not for sale. Our{' '}
        <Link href="/affiliate-disclosure">affiliate disclosure</Link> explains how the site earns money.
      </p>
    </LegalPage>
  );
}
